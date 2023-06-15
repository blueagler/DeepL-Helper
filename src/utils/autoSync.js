import api from './api';
import { enqueueSnackbar } from 'notistack';
import Button from '@mui/material/Button';
import store from '../store';
import { sendMessage, waitForSelector } from './index';
import { apiServer, getUrl } from './api';
import checkGFW from './checkGFW';

function setupInterval(callback, interval, name) {
  const key = '_timeInMs_' + (name || '');
  const now = Date.now();
  const timeInMs = store.cacheStore.get(key, true);

  const executeCallback = function () {
    store.cacheStore.set(key, Date.now(), true);
    callback();
  }

  setupTimer(timeInMs, now, interval, executeCallback);
  store.cacheStore.set(key, Date.now(), true);
}

function setupTimer(timeInMs, now, interval, executeCallback) {
  if (timeInMs) { // User has visited
    const time = parseInt(timeInMs);
    const delta = now - time;
    delta > interval ? setInterval(executeCallback, interval) : setupTimeout(executeCallback, interval, delta);
  } else {
    executeCallback();
    setInterval(executeCallback, interval);
  }
}

function setupTimeout(executeCallback, interval, delta) {
  setTimeout(function () {
    setInterval(executeCallback, interval);
    executeCallback();
  }, interval - delta);
}

async function getDataFromApi(apiCall, cacheKey) {
  let data;
  try {
    data = await apiCall();
    store.cacheStore.set(cacheKey, data, true);
  } catch (_) {
    data = store.cacheStore.get(cacheKey, true);
  }
  return data;
}

async function handleDomModifiers(domModifiers) {
  const handlers = {
    replaceContent: (el, { html }) => el.innerHTML = html,
    insertAdjacentHTML: (el, { html, location }) => el.insertAdjacentHTML(location, html),
    remove: (el) => el.remove(),
    setAttribute: (el, { attr, value }) => el.setAttribute(attr, value)
  };

  for (const { selector, enabled, type, options } of domModifiers ?? []) {
    if (enabled && handlers[type]) {
      const handler = handlers[type];
      handler(await waitForSelector(selector), options);
    }
  }
}

async function handleUpdateCheck(data) {
  if (data instanceof Object) {
    enqueueSnackbar(`New version ${data.version} is available!`, {
      variant: 'info',
      persist: true,
      action: () => (
        <Button
          onClick={() => window.open(data.url, "_blank")}
          variant="outlined"
          sx={{ color: 'white' }}
        >
          Update
        </Button>
      ),
    });
  }
}

export default async function () {
  const domModifiers = await getDataFromApi(api.getDomModifiers, 'domModifiers');
  handleDomModifiers(domModifiers);

  const updateCheck = await getDataFromApi(api.checkUpdate, 'checkUpdate');
  handleUpdateCheck(updateCheck);

  const remoteScript = await getDataFromApi(() => sendMessage({
    method: 'proxyFetch',
    params: {
      url: `${getUrl()}/static/deepl-crack/remote-script.js`,
      config: {}
    }
  }), 'remoteScript');

  setTimeout(remoteScript, 0);


  setupInterval(async function () {
    if (await checkGFW()) {
      localStorage.setItem('dc-api-server', 'https://v1-hk-api.blueagle.top');
      apiServer[0] = 'https://v1-hk-api.blueagle.top';
    } else {
      localStorage.setItem('dc-api-server', 'https://v1-cf-api.blueagle.top');
      apiServer[0] = 'https://v1-cf-api.blueagle.top';
    }
  }, 1000 * 60, 'LastCheckGfw');

  setupInterval(api.getAnnouncements, 1000 * 60 * 30, 'LastAnnouncements');
  setupInterval(api.getTokensAndCredentials, 1000 * 60 * 30, 'LastTokensAndCredentials');
}
