import { getRandom as randomUserAgent } from 'random-useragent';
import { uuid } from 'utils';
chrome = chrome ?? browser;

const identifierCookies = ['dapSid', 'LMTBID', 'dapUid'];

async function getCookies() {
  return await chrome.cookies.getAll({ url: 'https://www.deepl.com' });
}

async function removeCookie(cookie) {
  return await chrome.cookies.remove({
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

async function setHeader() {
  const { userAgent, cookie, regexFilter, urlFilter, resourceTypes = ['xmlhttprequest'], id, ip } = this.params;
  if (!id || (!regexFilter && !urlFilter)) {
    throw new Error('Missing required parameters');
  }
  const rule = {
    action: {
      type: "modifyHeaders",
      requestHeaders: [
        {
          "header": "User-Agent",
          "operation": "set",
          "value": userAgent || randomUserAgent()
        },
        {
          "header": "Cookie",
          "operation": "set",
          "value": cookie || await generateCookie()
        },
        {
          "header": "Sec-CH-UA",
          "operation": "remove"
        },
        {
          "header": "Sec-CH-UA-Mobile",
          "operation": "remove"
        },
        {
          "header": "Sec-CH-UA-Platform",
          "operation": "remove"
        },
        {
          "header": "X-Forwarded-For",
          "operation": "set",
          "value": ip || randomIp()
        },
        {
          "header": "CF-Connecting-IP",
          "operation": "set",
          "value": ip || randomIp()
        }
      ]
    },
    condition: { resourceTypes },
    id,
    priority: 1
  };
  regexFilter && (rule.condition.regexFilter = regexFilter);
  urlFilter && (rule.condition.urlFilter = urlFilter);
  await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: [id], addRules: [rule] });
  return rule;
}

async function redirectUrl() {
  const { url, regexFilter, urlFilter, resourceTypes = ['xmlhttprequest'], id } = this.params;
  if (!id || (!regexFilter && !urlFilter)) {
    throw new Error('Missing required parameters');
  }
  const rule = {
    action: {
      type: "redirect",
      redirect: {
        url
      },
      condition: { resourceTypes },
      id,
      priority: 1
    }
  };
  regexFilter && (rule.condition.regexFilter = regexFilter);
  urlFilter && (rule.condition.urlFilter = urlFilter);
  await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: [id], addRules: [rule] });
  return rule;
}

async function removeRule() {
  await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: [this.params.id] });
}
async function setApiToken() {
  const { token } = this.params;
  if (!token) {
    throw new Error('Missing required parameters');
  }
  const rule = {
    action: {
      type: "modifyHeaders",
      requestHeaders: [
        {
          "header": "Authorization",
          "operation": "set",
          "value": `DeepL-Auth-Key ${token}`
        }
      ]
    },
    condition: { resourceTypes: ['xmlhttprequest'], urlFilter: 'api-free.deepl.com' },
    id: 20,
    priority: 1
  };
  await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: [20], addRules: [rule] });
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
    case 'redirectUrl':
      run.call(this, [redirectUrl.call(this)]);
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