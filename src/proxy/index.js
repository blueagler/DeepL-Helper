import { openRules, sendRules } from './rules';
import store from '../store';
import { enqueueSnackbar } from 'notistack';

const originalXhrOpen = XMLHttpRequest.prototype.open;
const originalXhrSend = XMLHttpRequest.prototype.send;
const originalSetAttribute = Element.prototype.setAttribute;
const originalSubmit = HTMLFormElement.prototype.submit;

function getFileName() {
  const fileNameInput = this.querySelector('input[name="fileName"]');
  if (fileNameInput) {
    return fileNameInput.value.split('.').slice(0, -1).join('.');
  }
  const hijackCacheName = store.cacheStore.get('nextDocumentHijackName');
  if (hijackCacheName) {
    return hijackCacheName.split('.').slice(0, -1).join('.');
  }
  return String(Date.now());
}

function overrideResponse(xhr, response) {
  Object.defineProperty(xhr, 'responseText', {
    get() {
      return response.override;
    },
  });
  Object.defineProperty(xhr, 'status', {
    get() {
      return 200;
    },
  });
}

function handleResponse(xhr, response) {
  Object.defineProperty(xhr, 'responseText', {
    get() {
      return response.handler.call(xhr);
    },
  });
  Object.defineProperty(xhr, 'status', {
    get() {
      return 200;
    },
  });
}

function modifyHandler(xhr, rule) {
  if (rule.response) {
    if (rule.response.type === 'override') {
      overrideResponse(xhr, rule.response);
    } else if (rule.response.type === 'handler') {
      handleResponse(xhr, rule.response);
    }
    rule.drop = true;
  }
  if (rule.onErrorHandler) {
    xhr.addEventListener('error', rule.onErrorHandler);
  }
  if (rule.onLoadHandler) {
    xhr.addEventListener('readystatechange', () => {
      if (xhr.readyState === xhr.DONE) {
        rule.onLoadHandler.call(xhr);
      }
    });
  }
  if (rule.drop) {
    Object.defineProperty(xhr, 'send', {
      get() {
        return () => { };
      },
    });
    Object.defineProperty(xhr, 'setRequestHeader', {
      get() {
        return () => { };
      },
    });
    Object.defineProperty(xhr, 'readyState', {
      get() {
        return xhr.DONE;
      },
    });
    xhr.dispatchEvent(new Event('readystatechange'));
    return 'abort';
  }
}

function changeUrl(xhr, rule) {
  if (rule.changeUrl.type === 'handler') {
    xhr.url = rule.changeUrl.handler.call(xhr);
  } else if (rule.changeUrl.type === 'replace') {
    xhr.url = xhr.url.replace(rule.match, rule.changeUrl.replace);
  } else if (rule.changeUrl.type === 'override') {
    xhr.url = rule.changeUrl.override;
  }
}

function changePayload(xhr, rule) {
  if (rule.changePayload.type === 'replace') {
    xhr.payload = xhr.payload.replace(rule.matchPayload, rule.changePayload.replace);
  }
}

function downloadDocument(form) {
  const loading = store.loadingStore.add(`Downloading ${getFileName.call(form)}`);
  fetch(form.getAttribute('action'), {
    method: 'POST',
    body: new FormData(form),
    credentials: 'include',
  })
    .then(response => response.blob())
    .then(blob => {
      const name = getFileName.call(form);
      store.documentsStore.add(blob, name);
      store.windowsStore.toggle('documentsManager');
      enqueueSnackbar(`Your document ${name} has been downloaded to Documents Manager, if you want to remove editing protection, please click the unlock button.`, {
        variant: 'info',
      });
    })
    .catch(() => originalSubmit.call(form))
    .finally(() => store.loadingStore.remove(loading));
}

function overrideXhrOpen() {
  XMLHttpRequest.prototype.open = async function (method, url, ...rest) {
    this.method = method;
    this.url = url;
    for (const rule of openRules) {
      if (typeof this.url === 'string' && rule.match.test(this.url)) {
        if (rule.await) {
          await rule.await.call(this);
        }
        if (modifyHandler(this, rule) === 'abort' || this.DONNOTSEND) {
          return;
        }
        if (rule.changeUrl) {
          changeUrl(this, rule);
        }
        if (rule.changeMethod) {
          this.method = rule.changeMethod;
        }
      }
    }
    return originalXhrOpen.call(this, this.method, this.url, ...rest);
  };
}

function overrideXhrSend() {
  XMLHttpRequest.prototype.send = function (payload, ...rest) {
    this.payload = payload;
    (async () => {
      for (const rule of sendRules) {
        if ((rule.matchPayload && rule.matchPayload.test(this.payload)) || (rule.matchUrl && rule.matchUrl.test(this.url))) {
          if (rule.await) {
            await rule.await.call(this);
          }
          if (modifyHandler(this, rule) === 'abort' || this.DONNOTSEND) {
            return;
          }
          if (rule.changePayload) {
            changePayload(this, rule);
          }
        }
      }
      originalXhrSend.call(this, this.payload, ...rest);
    })();
  };
}

function overrideSetAttribute() {
  Element.prototype.setAttribute = function (name, value) {
    if (this.tagName === 'INPUT') {
      if (name === 'value' && this.getAttribute('name') === 'expectsPro') {
        value = 'false';
      } else if (name === 'value' && this.getAttribute('name') === 'fileName') {
        store.cacheStore.set('nextDocumentHijackName', value);
      }
    }
    originalSetAttribute.call(this, name, value);
  };
}

function overrideFormSubmit() {
  HTMLFormElement.prototype.submit = function () {
    if (/documentTranslation/.test(this.getAttribute('action'))) {
      downloadDocument(this);
    } else {
      originalSubmit.call(this);
    }
  };
}

export function proxy() {
  overrideXhrOpen();
  overrideXhrSend();
  overrideSetAttribute();
  overrideFormSubmit();
}

export function unproxy() {
  Element.prototype.setAttribute = originalSetAttribute;
  XMLHttpRequest.prototype.open = originalXhrOpen;
  XMLHttpRequest.prototype.send = originalXhrSend;
  HTMLFormElement.prototype.submit = originalSubmit;
}
