import { openRules, sendRules } from './rules';
import store from 'store';

const originalXhrOpen = XMLHttpRequest.prototype.open;
const originalXhrSend = XMLHttpRequest.prototype.send;
const originalSetAttribute = Element.prototype.setAttribute;
const originalSubmit = HTMLFormElement.prototype.submit;

function getFileName() {
  const fileNameInput = this.querySelector('input[name="fileName"]');
  if (fileNameInput) {
    return fileNameInput.value.split('.').slice(0, -1).join('.');
  }
  const hijackCacheName = store.cacheStore.getCache('nextDocumentHijackName');
  if (hijackCacheName) {
    return hijackCacheName.split('.').slice(0, -1).join('.');
  }
  return Date();
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
        break;
      case 'handler':
        Object.defineProperty(this, "responseText", {
          get: () => rule.response.handler.call(this),
        });
        Object.defineProperty(this, "status", {
          get: () => 200,
        });
        break;
    }
    rule.drop = true;
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

function changeUrlHandler(rule) {
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

function changePayloadHandler(rule) {
  switch (rule.changePayload.type) {
    case 'replace':
      this.payload = this.payload.replace(rule.matchPayload, rule.changePayload.replace);
      break;
  }
}

function downloadDocument() {
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
        if (modifyHandler.call(this, rule) === 'abort' || this.DONNOTSEND) {
          return
        }
        if (rule.changeUrl) {
          changeUrlHandler.call(this, rule);
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
          if (modifyHandler.call(this, rule) === 'abort' || this.DONNOTSEND) {
            return
          }
          if (rule.changePayload) {
            changePayloadHandler.call(this, rule);
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
      downloadDocument.call(this);
    } else {
      originalSubmit.call(this);
    }
  }
}

export function unproxy() {
  Element.prototype.setAttribute = originalSetAttribute;
  XMLHttpRequest.prototype.open = originalXhrOpen;
  XMLHttpRequest.prototype.send = originalXhrSend;
  HTMLFormElement.prototype.submit = originalSubmit;
}