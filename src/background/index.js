import { getRandom as randomUserAgent } from 'random-useragent';
import { uuid } from 'utils';
chrome = chrome ?? browser;

const identifierCookies = ['dapSid', 'LMTBID', 'dapUid'];

function getCookies() {
  return chrome.cookies.getAll({ url: 'https://www.deepl.com' });
}

function removeCookie(cookie) {
  return chrome.cookies.remove({
    url: `https://www.deepl.com/`,
    name: cookie
  })
}

async function generateCookie() {
  return encodeURIComponent((await getCookies())
    .map((cookie) => {
      switch (cookie.name) {
        case 'dapUid':
          cookie.value = uuid();
          break;
        case 'dapSid':
          cookie.value = `{"sid":"${uuid()}","lastUpdate":${Math.floor(Date.now() / 1000)}}`;
          break;
        case 'LMTBID':
          cookie.value = '';
          break;
        default:
          break;
      }
      return `${cookie.name}=${cookie.value};`
    })
    .join(''))
}

function randomIp() {
  return Array.from({ length: 4 }, () => Math.floor(Math.random() * 255)).join('.');
}

function createRule(action, condition, id) {
  return {
    action,
    condition,
    id,
    priority: 1
  };
}

function addFilters(rule, regexFilter, urlFilter) {
  regexFilter && (rule.condition.regexFilter = regexFilter);
  urlFilter && (rule.condition.urlFilter = urlFilter);
}

function updateRules(removeRuleIds, addRules) {
  return chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds, addRules });
}

async function setHeader() {
  const { userAgent, cookie, regexFilter, urlFilter, resourceTypes, id, ip } = this.params;
  if (!id || (!regexFilter && !urlFilter)) {
    throw new Error('Missing required parameters');
  }
  const [IP, UA, COOKIE] = [
    ip || randomIp(),
    userAgent || randomUserAgent((ua) => {
      return /(Windows|Macintosh|Linux|Android|iPhone|iPad)/.test(ua.osName) && !/Legacy/.test(ua.folder);
    }),
    cookie || await generateCookie()
  ];
  const action = {
    type: "modifyHeaders",
    requestHeaders: [
      {
        "header": "User-Agent",
        "operation": "set",
        "value": UA
      },
      {
        "header": "Cookie",
        "operation": "set",
        "value": COOKIE
      }
    ]
  };
  ["Sec-CH-UA", "Sec-CH-UA-Mobile", "Sec-CH-UA-Platform"].forEach((header) => {
    action.requestHeaders.push({
      "header": header,
      "operation": "remove"
    });
  });
  ["X-Forwarded-For", "CF-Connecting-IP", "X-Originating-IP", "X-Remote-IP", "X-Client-IP", "X-Real-IP", "True-Client-IP"].forEach((header) => {
    action.requestHeaders.push({
      "header": header,
      "operation": "set",
      "value": IP
    });
  });
  const condition = { resourceTypes };
  const rule = createRule(action, condition, id);
  addFilters(rule, regexFilter, urlFilter);
  await updateRules([id], [rule]);
  return rule;
}

async function setApiToken() {
  const { token } = this.params;
  if (!token) {
    throw new Error('Missing required parameters');
  }
  const action = {
    type: "modifyHeaders",
    requestHeaders: [
      {
        "header": "Authorization",
        "operation": "set",
        "value": `DeepL-Auth-Key ${token}`
      }
    ]
  };
  const condition = { resourceTypes: ['xmlhttprequest'], urlFilter: 'api-free.deepl.com' };
  const rule = createRule(action, condition, 20);
  await updateRules([20], [rule]);
  return rule;
}

async function run(promises) {
  const results = [];
  const errors = [];

  setTimeout(() => this.sendResponse({
    success: false,
    error: 'Timeout'
  }), 10000);

  for (const promise of promises) {
    try {
      results.push(await promise);
    } catch (e) {
      errors.push(e);
    }
  }

  const response = {};

  if (errors.length > 0) {
    if (errors.length === 1) {
      response.error = errors[0];
    } else {
      response.errors = errors;
    }
    response.success = false;
  } else {
    if (results.length === 1) {
      response.result = results[0];
    } else {
      response.results = results;
    }
    response.success = true;
  }
  this.sendResponse(response);
}

async function proxyFetch() {
  const { url, config } = this.params;
  const result = await (await fetch(url, config)).text();
  return result;
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  const { method, params } = message;
  this.sender = sender;
  this.sendResponse = sendResponse;
  this.params = params;

  switch (method) {
    case 'proxyFetch':
      run.call(this, [proxyFetch.call(this)]);
      return true;
    case 'setHeader':
      run.call(this, [setHeader.call(this)]);
      return true;
    case 'cleanIdentifierCookie':
      run.call(this, [...identifierCookies.map(cookie => removeCookie.call(this, cookie))]);
      return true;
    case 'removeRule':
      run.call(this, [removeRule.call(this)]);
      return true;
    case 'setApiToken':
      run.call(this, [setApiToken.call(this)]);
      return true;
  }
  sendResponse({
    success: false,
    error: 'Unknown method'
  })
});