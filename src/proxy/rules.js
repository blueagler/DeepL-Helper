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
        if (store.tokenStore.getActiveToken?.type === 'deepl-api-free-token') {
          return 'https://api-free.deepl.com/v2/translate';
        } else if (store.tokenStore.getActiveToken?.type !== 'pro-session') {
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
      switch (new URL(this.url).searchParams.get('method')) {
        case 'LMT_handle_jobs':
          enqueueSnackbar('Translation failed due to that your input is too long. Please try again with a shorter text.', {
            variant: 'error'
          });
          break;
      }
    },
    onLoadHandler() {
      switch (this.status) {
        case 429:
          enqueueSnackbar('Reached IP frequency limitation of free web api. You can try again later, use a proxy, or use a token/seesion in Token Manager. ', {
            variant: 'error'
          });
          break;
      }
    },
  },
  {
    match: /api-free.deepl.com\/v2\/translate/,
    onErrorHandler() {
      enqueueSnackbar('Translation failed due to that your input is too long. Please try again with a shorter text.', {
        variant: 'error'
      });
    },
    onLoadHandler() {
      switch (this.status) {
        case 429:
          enqueueSnackbar('Translation failed due to the IP frequency limitation. Please try again later or use a proxy.', {
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
    onLoadHandler() {
      switch (this.status) {
        case 429:
          enqueueSnackbar('Translation failed due to the IP frequency limitation. Please try again later or use a proxy.', {
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
        enqueueSnackbar('Translation was blocked due to the limitation. Do you want to clean identifier cookies and try again? (Page will reload). If it still does not work, you need to use a proxy to change your IP and click Clean Cookie Button again.', {
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
    matchUrl: /www2\.deepl\.com\/jsonrpc\?method=LMT_handle_jobs/,
    async await() {
      const maxTextLength = 1000;
      function parseAndCheckPayload(payload) {
        const parsedPayload = JSON.parse(payload);
        const textLength = parsedPayload.params.jobs.map(job => job.sentences[0].text).join('').length;
        return { parsedPayload, textLength };
      }

      function splitJobs(jobs) {
        let batches = [];
        for (const job of jobs) {
          if (batches.length === 0) {
            batches.push([job]);
          } else {
            const lastBatch = batches[batches.length - 1];
            const lastBatchTextLength = lastBatch.map(job => job.sentences[0].text).join('').length;
            if (lastBatchTextLength + job.sentences[0].text.length >= maxTextLength) {
              batches.push([job]);
            } else {
              lastBatch.push(job);
            }
          }
        }
        return batches;
      }

      function getRandomNumber() {
        const rand = Math.floor(Math.random() * 99999) + 100000;
        return rand * 1000;
      }

      function getTimeStamp(translate_text) {
        let iCount = translate_text.split('i').length - 1;
        const ts = Date.now();
        if (iCount !== 0) {
          iCount = iCount + 1;
          return ts - (ts % iCount) + iCount;
        } else {
          return ts;
        }
      }

      function formatBody(payload, id, job) {
        let r = JSON.stringify({
          ...payload,
          id,
          params: {
            ...payload.params,
            jobs: job,
            timestamp: getTimeStamp(job.map(job => job.sentences[0].text).join(''))
          },
        });
        if ((id + 5) % 29 === 0 || (id + 3) % 13 === 0) {
          r = r.replace('"method":"', '"method" : "');
        } else {
          r = r.replace('"method":"', '"method": "');
        }
        return r;
      }

      async function fetchTranslation(url, body) {
        await sendMessage({
          method: 'setHeader',
          params: {
            regexFilter: "^https://www2\\.deepl\\.com/jsonrpc",
            id: 1
          }
        });
        try {
          const r = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body,
          });
          switch (r.status) {
            case 200:
              return await r.json();;
            case 429:
              throw new Error('Reached IP frequency limitation of free web api. You can try again later, use a proxy, or use a token/seesion in Token Manager. ');
            default:
              throw new Error('Unknown error.');
          }
        } catch (error) {
          throw new Error(error);
        }
      }

      function mergeResults(results) {
        let mergedResult = null;
        for (const result of results) {
          if (mergedResult === null) {
            mergedResult = result;
          } else {
            mergedResult.result.translations = [
              ...mergedResult.result.translations,
              ...result.result.translations
            ]
          }
        }
        return mergedResult;
      }

      function overrideProperties(result) {
        this.DONNOTSEND = true;
        Object.defineProperty(this, "responseText", {
          get: function () {
            return JSON.stringify(result);
          }.bind(this),
        })
        Object.defineProperty(this, "readyState", {
          get: () => this.DONE,
        });
        Object.defineProperty(this, "status", {
          get: () => 200,
        });
        this.dispatchEvent(new Event('readystatechange'));
      }

      const { parsedPayload, textLength } = parseAndCheckPayload(this.payload);

      if (textLength > maxTextLength) {
        const batches = splitJobs(parsedPayload.params.jobs);
        let results = [];
        for (const batch of batches) {
          const id = getRandomNumber();
          const body = formatBody(parsedPayload, id, batch);
          try {
            const json = await fetchTranslation(this.url, body);
            results.push(json);
            enqueueSnackbar(`Batch ${batches.indexOf(batch) + 1} of ${batches.length} successfully translated.`, { variant: 'success' });
          } catch (error) {
            enqueueSnackbar(`Batch ${batches.indexOf(batch) + 1} of ${batches.length} failed to translate. Reason: ${error.message}`, { variant: 'error' });
            break;
          }
        }
        const mergedResult = mergeResults(results);
        overrideProperties.call(this, mergedResult);
      }
    }
  },
  {
    matchUrl: /api-free.deepl.com\/v2\/translate/,
    async await() {
      function parsePayload(payload) {
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
        const text = payload.params.jobs.map(job => job.sentences[0].text);
        const target_lang = payload.params.lang.target_lang;
        return { text, target_lang, source_lang, formality };
      }
      function createNewPayload(text, target_lang, source_lang, formality) {
        const newPayload = {
          text,
          target_lang,
          source_lang,
          split_sentences: '0',
          formality
        };
        return JSON.stringify(newPayload);
      }
      function rewritePayload(payload) {
        const { text, target_lang, source_lang, formality } = parsePayload(payload);
        return createNewPayload(text, target_lang, source_lang, formality);
      }
      function createResponse(result, payload) {
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
            "target_lang": payload.target_lang,
            "source_lang": result.translations[0].detected_source_language,
            "source_lang_is_confident": false,
            "detectedLanguages": {}
          }
        };
        return JSON.stringify(response)
      }
      this.payload = rewritePayload(this.payload);
      await sendMessage({
        method: 'setApiToken',
        params: {
          token: store.tokenStore.getActiveToken?.token,
        }
      });
      Object.defineProperty(this, "responseText", {
        get: function () {
          if (this.status !== 200) {
            return `{"jsonrpc":"2.0","error":{"code":0,"message":"Check Your Token"}}`
          }
          const result = JSON.parse(this.response);
          return createResponse(result, this.payload)
        }.bind(this),
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
          cookie: `dl_session=${store.tokenStore.getActiveToken?.session};`,
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