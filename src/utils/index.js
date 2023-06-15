export const downloadDirectly = (blob, name) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
}

export async function waitForSelector(selector, opts = {}) {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector)
    if (element) {
      resolve(element)
      return
    }
    const mutObserver = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        const nodes = Array.from(mutation.addedNodes)
        for (const node of nodes) {
          if (node.matches && node.matches(selector)) {
            mutObserver.disconnect()
            resolve(node)
            return
          }
        }
      }
    })
    mutObserver.observe(document.documentElement, { childList: true, subtree: true })
    if (opts.timeout) {
      setTimeout(() => {
        mutObserver.disconnect()
        if (opts.optional) {
          resolve(null)
        } else {
          reject(new Error(`Timeout exceeded while waiting for selector ("${selector}").`))
        }
      }, opts.timeout)
    }
  })
}
export function sendMessage(message) {
  return new Promise((resolve, reject) => {
    window.addEventListener("DeepL-Crack-Receive", function ({ detail: payload }) {
      if (payload.success) {
        if (payload.result) {
          resolve(payload.result);
        } else if (payload.results) {
          resolve(payload.results);
        } else {
          reject(new Error(`Unexpected response from background script.`));
        }
      } else {
        if (payload.errors) {
          reject(payload.errors);
        } else if (payload.error) {
          reject(payload.error);
        } else {
          reject(new Error(`Unexpected response from background script.`));
        }
      }
    }, { once: true });
    window.dispatchEvent(new CustomEvent("DeepL-Crack-Send", { detail: message }));
    setTimeout(() => {
      reject(new Error(`Timeout exceeded while waiting for response from background script.`))
    }, 10000)
  })
}

export async function cleanCookies() {
  await sendMessage({ method: 'cleanIdentifierCookie' })
  function expires(mins) {
    var date = new Date()
    date.setTime(date.getTime() + (mins * 60 * 1000))
    return date.toUTCString()
  }
  document.cookie = "dapSid=" + encodeURIComponent(JSON.stringify({
    sid: uuid(),
    lastUpdate: Math.floor(Date.now() / 1000)
  })) + "; domain=.deepl.com; "
    + "path=/; expires=" + expires(30) + "; samesite=lax";
  document.cookie = "dapUid=" + encodeURIComponent(uuid()) + "; domain=.deepl.com; "
    + "path=/; expires=" + expires(518400) + "; samesite=lax";
  await sendMessage({
    method: 'setHeader',
    params: {
      urlFilter: 'www.deepl.com',
      resourceTypes: ['main_frame', "sub_frame", "xmlhttprequest"],
      id: 2
    }
  });
}

export function uuid() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, function (c) {
    return (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  })
}