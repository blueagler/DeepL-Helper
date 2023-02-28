import { openRules, sendRules } from './rules';
import store from 'store';
import { waitForSelector } from 'utils';
import { enqueueSnackbar } from 'notistack';

const originalXhrOpen = XMLHttpRequest.prototype.open;
const originalXhrSend = XMLHttpRequest.prototype.send;
const originalSetAttribute = Element.prototype.setAttribute;
const originalSubmit = HTMLFormElement.prototype.submit;

function getFileName() {
  function cleanExtension(fileName) {
    fileName = fileName.split('.');
    fileName.pop();
    return fileName.join('.');
  }
  const fileNameInput = this.querySelector('input[name="fileName"]');
  if (fileNameInput) {
    return cleanExtension(fileNameInput.value);
  }
  const hijackCacheName = store.cacheStore.getCache('nextDocumentHijackName');
  if (hijackCacheName) {
    return cleanExtension(hijackCacheName);
  }
  return Date()
}

let maxChars = 1000;

function pasteHandler(e) {
  if (store.tokenStore.getActiveId?.type === 'deepl-api-free-token') {
    maxChars = 5000;
  } else if (store.tokenStore.getActiveId?.type !== 'pro-session') {
    maxChars = null;
  }
  if (!maxChars) {
    return;
  }
  if (store.cacheStore.getCache('longTextTranslation') === 'pending') {
    e.preventDefault();
    return;
  }
  const text = e.clipboardData.getData('text/plain');
  if (text.length > maxChars) {
    e.preventDefault();
    const loading = store.loadingStore.addLoading('Translating long text');
    const splitedChunks = [];
    for (let i = 0; i < text.length; i += maxChars) {
      splitedChunks.push(text.substr(i, maxChars));
    }
    (async () => {
      try {
        for (const text of splitedChunks) {
          store.cacheStore.setCache('longTextTranslation', 'pending');
          const curserPosition = e.target.selectionStart + text.length;
          e.target.value = e.target.value.slice(0, e.target.selectionStart) + text + e.target.value.slice(e.target.selectionEnd);
          e.target.setSelectionRange(curserPosition, curserPosition);
          e.target.dispatchEvent(new Event('input', { bubbles: true }));
          await waitTillFinished();
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        enqueueSnackbar(error, { variant: 'error' });
      }
      store.loadingStore.removeLoading(loading);
      store.cacheStore.setCache('longTextTranslation', 'none');
    })();
  }
}

function modifyHandler(rule) {
  if (rule.response) {
    switch (rule.response.type) {
      case 'override':
        Object.defineProperty(this, "responseText", {
          get: () => rule.response.override,
        });
        Object.defineProperty(this, "status", {
          get: () => 200,
        });
        rule.drop = true;
        break;
      case 'handler':
        Object.defineProperty(this, "responseText", {
          get: () => rule.response.handler.call(this),
        });
        Object.defineProperty(this, "status", {
          get: () => 200,
        });
        rule.drop = true;
        break;
    }
  }
  if (rule.onErrorHandler) {
    this.addEventListener('error', rule.onErrorHandler);
  }
  if (rule.onLoadHandler) {
    this.addEventListener('readystatechange', () => {
      if (this.readyState === this.DONE) {
        rule.onLoadHandler.call(this);
      }
    });
  }
  if (rule.drop) {
    Object.defineProperty(this, "send", {
      get: () => () => { },
    });
    Object.defineProperty(this, "setRequestHeader", {
      get: () => () => { },
    });
    Object.defineProperty(this, "readyState", {
      get: () => this.DONE,
    });
    this.dispatchEvent(new Event('readystatechange'));
    return 'abort'
  }
}


export function proxy() {
  XMLHttpRequest.prototype.open = async function (method, url, ...rest) {
    this.method = method;
    this.url = url;
    for (const rule of openRules) {
      if (typeof this.url === 'string' && rule.match.test(this.url)) {
        if (rule.await) {
          await rule.await.call(this);
        }
        if (modifyHandler.call(this, rule) === 'abort') {
          return
        }
        if (rule.changeUrl) {
          switch (rule.changeUrl.type) {
            case 'handler':
              this.url = rule.changeUrl.handler.call(this);
              break;
            case 'replace':
              this.url = this.url.replace(rule.match, rule.changeUrl.replace);
              break;
            case 'override':
              this.url = rule.changeUrl.override;
              break;
          }
        }
        if (rule.changeMethod) {
          this.method = rule.changeMethod;
        }
      }
    }
    method = this.method;
    url = this.url;
    return originalXhrOpen.call(this, method, url, ...rest);
  };
  XMLHttpRequest.prototype.send = function (payload, ...rest) {
    this.payload = payload;
    (async () => {
      for (const rule of sendRules) {
        if ((rule.matchPayload && rule.matchPayload.test(this.payload)) || (rule.matchUrl && rule.matchUrl.test(this.url))) {
          if (rule.await) {
            await rule.await.call(this);
          }
          if (modifyHandler.call(this, rule) === 'abort') {
            return
          }
          if (rule.changePayload) {
            switch (rule.changePayload.type) {
              case 'replace':
                this.payload = this.payload.replace(rule.matchPayload, rule.changePayload.replace);
                break;
            }
          }
        }
      }
      payload = this.payload;
      originalXhrSend.call(this, payload, ...rest);
    })();
  };
  Element.prototype.setAttribute = function (name, value) {
    if (this.tagName === 'INPUT') {
      if (name === 'value' && this.getAttribute('name') === 'expectsPro') {
        value = 'false';
      } else if (name === 'value' && this.getAttribute('name') === 'fileName') {
        store.cacheStore.setCache('nextDocumentHijackName', value);
      }
    }
    originalSetAttribute.call(this, name, value);
  }
  HTMLFormElement.prototype.submit = function () {

    if (/documentTranslation/.test(this.getAttribute('action'))) {
      const loading = store.loadingStore.addLoading(`Downloading ${getFileName.call(this)}`);

      fetch(this.getAttribute('action'), {
        method: 'POST',
        body: new FormData(this),
        credentials: 'include',
      })
        .then(response => response.blob())
        .then(response => {
          const name = getFileName.call(this);
          store.documentStore.addDocument(response, name);
          store.windowStore.toggleDocumentWindow();
        })
        .catch(() => originalSubmit.call(this))
        .finally(() => store.loadingStore.removeLoading(loading))

    } else {
      originalSubmit.call(this);
    }
  }
  waitForSelector('.lmt__source_textarea')
    .then(textarea => textarea.addEventListener('paste', pasteHandler))
}
export function unproxy() {
  Element.prototype.setAttribute = originalSetAttribute;
  XMLHttpRequest.prototype.open = originalXhrOpen;
  XMLHttpRequest.prototype.send = originalXhrSend;
  HTMLFormElement.prototype.submit = originalSubmit;
  waitForSelector('.lmt__source_textarea')
    .then(textarea => textarea.removeEventListener('paste', pasteHandler))
}

function waitTillFinished() {
  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      if (!['none', 'pending'].includes(store.cacheStore.getCache('longTextTranslation'))) {
        clearInterval(interval);
        if (store.cacheStore.getCache('longTextTranslation') === 'success') {
          resolve();
        } else if (store.cacheStore.getCache('longTextTranslation') === 'failed') {
          reject();
        }
      }
    }, 10);
  });
}
