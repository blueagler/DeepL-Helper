import { enqueueSnackbar } from 'notistack'
import { cleanCookies } from "utils";
import Button from '@mui/material/Button';
import { sendMessage } from 'utils'
import store from 'store';

export const openRules = [
  {
    match: /getClientState/,
    response: {
      type: 'override',
      override: '{"jsonrpc":"2.0","id":0,"result":{"proAvailable":true,"updateNecessary":false,"featureSet":{"translator":{"service":"pro","formality":true},"documentTranslation":{"service":"free","pdf":"noAccountConsent","formality":true},"glossary":{"termbaseService":false,"sharing":false,"uploadAndDownload":false,"maxEntriesPerGlossary":0,"maxGlossaries":0}},"ep":true,"loginState":{"accountId":"0"},"notifications":[]}}'
    }
  },
  {
    match: /getAccountId/,
    response: {
      type: 'override',
      override: '{"jsonrpc":"2.0","result":{"accountId":0},"id":0}'
    }
  },
  {
    match: /enableDataUse/,
    response: {
      type: 'override',
      override: '{"jsonrpc":"2.0","result":null,"id":0}'
    }
  },
  {
    match: /getUserDisplayName/,
    response: {
      type: 'override',
      override: '{"jsonrpc":"2.0","result":{"name":"DeepL Cracked"},"id":0}',
    }
  },
  {
    match: /getActiveSubscriptionInfo/,
    response: {
      type: 'override',
      override: '{"jsonrpc":"2.0","result":{"multipleGlossariesLimit":0,"isActive":true,"supportsWebTranslator":true},"id":0}',
    }
  },
  {
    match: /getQuotaInfo/,
    response: {
      type: 'override',
      override: '{"jsonrpc":"2.0","result":{"documentQuota":{"accountDocumentCount":9999,"accountDocumentLimit":9999},"billingPeriodStart":0,"billingPeriodEnd":4070880000000},"id":0}',
    }
  },
  {
    match: /LMT_handle_jobs/,
    changeUrl: {
      type: 'handler',
      handler() {
        if (store.tokenStore.getActiveId?.type === 'deepl-api-free-token') {
          return 'https://api-free.deepl.com/v2/translate';
        } else if (store.tokenStore.getActiveId?.type !== 'pro-session') {
          return this.url.replace('api.deepl.com', 'www2.deepl.com');
        }
        return this.url
      }
    }
  },
  {
    match: /LMT_split_text/,
    changeUrl: {
      type: 'override',
      override: 'https://www2.deepl.com/jsonrpc?method=LMT_split_text'
    }
  },
  {
    match: /write-pro.www.deepl.com/,
    changeUrl: {
      type: 'replace',
      replace: 'write-free.www.deepl.com'
    }
  },
  {
    match: /expectsPro=true/,
    changeUrl: {
      type: 'replace',
      replace: 'expectsPro=false'
    }
  },
  {
    match: /explicitPdfConsent=false/,
    changeUrl: {
      type: 'replace',
      replace: 'explicitPdfConsent=true'
    }
  },
  {
    match: /^https:\/\/(.*).deepl.com\/web\/statistics/,
    drop: true
  },
  {
    match: /www2\.deepl\.com\/jsonrpc/,
    onErrorHandler() {
      store.cacheStore.setCache('longTextTranslation', 'failed');
      switch (new URL(this.url).searchParams.get('method')) {
        case 'LMT_handle_jobs':
          enqueueSnackbar('Your translation failed due to that your input is too long. Please try again with a shorter text.', {
            variant: 'error'
          });
          break;
      }
    },
    onLoadHandler() {
      switch (new URL(this.url).searchParams.get('method')) {
        case 'LMT_handle_jobs':
          clearTimeout(window.dpt1);
          store.cacheStore.setCache('longTextTranslation', this.status === 200 ? 'success' : 'failed');
          break;
        case 'LMT_split_text':
          if (this.status !== 200) {
            store.cacheStore.setCache('longTextTranslation', 'failed');
          }
          if (this.status === 200) {
            window.dpt1 && clearTimeout(window.dpt1);
            window.dpt1 = setTimeout(() => {
              store.cacheStore.setCache('longTextTranslation', 'success')
            }, 1000);
          }
          break;
      }
      switch (this.status) {
        case 429:
          enqueueSnackbar('Your translation failed due to the IP frequency limitation. Please try again later or use a proxy.', {
            variant: 'error'
          });
          break;
      }
    },
  },
  {
    match: /api-free.deepl.com\/v2\/translate/,
    onErrorHandler() {
      store.cacheStore.setCache('longTextTranslation', 'failed');
      enqueueSnackbar('Your translation failed due to that your input is too long. Please try again with a shorter text.', {
        variant: 'error'
      });
    },
    onLoadHandler() {
      window.dpt1 && clearTimeout(window.dpt1);
      store.cacheStore.setCache('longTextTranslation', this.status === 200 ? 'success' : 'failed');
      switch (this.status) {
        case 429:
          enqueueSnackbar('Your translation failed due to the IP frequency limitation. Please try again later or use a proxy.', {
            variant: 'error'
          });
          break;
        case 456:
          enqueueSnackbar('The quota of this DeepL Api Free Token has been used up. Please change your token. ', {
            variant: 'error'
          });
          break;
        case 403:
          enqueueSnackbar('This DeepL Api Free Token is invalid. Please change it. ', {
            variant: 'error'
          });
          break;
      }
    },
  },
  {
    match: /api.deepl.com\/jsonrpc/,
    onErrorHandler() {
      store.cacheStore.setCache('longTextTranslation', 'failed');
    },
    onLoadHandler() {
      switch (new URL(this.url).searchParams.get('method')) {
        case 'LMT_handle_jobs':
          clearTimeout(window.dpt1);
          store.cacheStore.setCache('longTextTranslation', this.status === 200 ? 'success' : 'failed');
          break;
        case 'LMT_split_text':
          if (this.status !== 200) {
            store.cacheStore.setCache('longTextTranslation', 'failed');
          }
          if (this.status === 200) {
            window.dpt1 && clearTimeout(window.dpt1);
            window.dpt1 = setTimeout(() => {
              store.cacheStore.setCache('longTextTranslation', 'success')
            }, 1000);
          }
          break;
      }
      switch (this.status) {
        case 429:
          enqueueSnackbar('Your translation failed due to the IP frequency limitation. Please try again later or use a proxy.', {
            variant: 'error'
          });
          break;
        case 403:
          enqueueSnackbar('This Pro Session is invalid. Please change it. ', {
            variant: 'error'
          });
          break;
      }
    },
  },
  {
    match: /^https:\/\/backend.deepl.com\/documentTranslation\?method=getTranslationStatus/,
    onLoadHandler() {
      if (this.status == 400 && JSON.parse(this.responseText).error.code == 800) {
        enqueueSnackbar('Your translation was blocked due to the limitation. Do you want to clean identifier cookies and try again? (Page will reload)', {
          action: () =>
            <Button
              onClick={() => {
                try {
                  cleanCookies()
                } catch (error) {
                  enqueueSnackbar(error.message, { variant: 'error' })
                }
              }}
              sx={{ color: 'white' }}
            >
              Yes
            </Button>,
          variant: 'warning',
          persist: true,
        });
      }
    }
  }
]

export const sendRules = [
  {
    matchPayload: /"expectsPro":true/,
    changePayload: {
      type: 'replace',
      replace: '"expectsPro":false'
    }
  },
  {
    matchUrl: /api-free.deepl.com\/v2\/translate/,
    async await() {
      function rewritePayload(payload) {
        payload = JSON.parse(payload);
        let formality = "default";
        switch (payload.params.commonJobParams.formality) {
          case "formal":
            formality = "prefer_more";
            break;
          case "informal":
            formality = "prefer_less";
            break;
        }
        let source_lang = null;
        if (payload.params.lang.source_lang) {
          source_lang = payload.params.lang.source_lang;
        }
        if (payload.params.lang.source_lang_computed) {
          source_lang = payload.params.lang.source_lang_computed;
        }
        if (payload.params.lang.source_lang_user_selected) {
          source_lang = payload.params.lang.source_lang_user_selected;
        }
        if (source_lang === 'auto') {
          source_lang = undefined
        }
        const newPayload = {
          text: payload.params.jobs.map(job => job.sentences[0].text),
          target_lang: payload.params.lang.target_lang,
          source_lang,
          split_sentences: '0',
          formality
        };
        return JSON.stringify(newPayload);
      }
      this.payload = rewritePayload(this.payload);
      await sendMessage({
        method: 'setApiToken',
        params: {
          token: store.tokenStore.getActiveId?.token,
        }
      });
      const responseGetter = function () {
        if (this.status !== 200) {
          return `{"jsonrpc":"2.0","error":{"code":0,"message":"Check Your Token"}}`
        }
        const result = JSON.parse(this.response);
        const response = {
          "jsonrpc": "2.0",
          "id": 0,
          "result": {
            "translations": result.translations.map((translation, index) => ({
              "beams": [
                {
                  "num_symbols": translation.text.split('').reduce((acc, char) => acc + (char.charCodeAt(0) > 0x10000 ? 2 : 1), 0),
                  "sentences": [
                    {
                      "ids": [index],
                      "text": translation.text,
                    }
                  ]
                }
              ],
              "quality": "normal"
            })),
            "target_lang": this.payload.target_lang,
            "source_lang": result.translations[0].detected_source_language,
            "source_lang_is_confident": false,
            "detectedLanguages": {}
          }
        };
        return JSON.stringify(response)
      }.bind(this);
      Object.defineProperty(this, "responseText", {
        get: responseGetter,
      })
    }
  },
  {
    matchPayload: /"method":"createTermbase"/,
    onLoadHandler() {
      enqueueSnackbar('DeepL Crack does not support creating termbases', { variant: 'warning' });
    }
  },
  {
    matchPayload: /"method":"(.*)Term(.*)"/,
    response: {
      type: 'override',
      override: '{"jsonrpc":"2.0","result":null,"id":0}'
    }
  },
  {
    matchUrl: /www2\.deepl\.com\/jsonrpc/,
    async await() {
      await sendMessage({
        method: 'setHeader',
        params: {
          regexFilter: "^https://www2\\.deepl\\.com/jsonrpc",
          id: 1
        }
      });
    }
  },
  {
    matchUrl: /api\.deepl\.com\/jsonrpc/,
    async await() {
      await sendMessage({
        method: 'setHeader',
        params: {
          regexFilter: "^https://api\\.deepl\\.com/jsonrpc",
          cookie: `dl_session=${store.tokenStore.getActiveId?.session};`,
          id: 1
        }
      });
    }
  },
  {
    matchUrl: /backend\.deepl\.com\/documentTranslation\/upload/,
    async await() {
      const loading = store.loadingStore.addLoading('Sending clearance request');
      try {
        await fetch("https://clearance.deepl.com/token", {
          "mode": "cors",
          "credentials": "include"
        })
        enqueueSnackbar('Clerance request sent', { variant: 'success' });
      } catch (_) {
        enqueueSnackbar('Clerance request failed', { variant: 'error' });
      }
      store.loadingStore.removeLoading(loading)
    }
  }
]