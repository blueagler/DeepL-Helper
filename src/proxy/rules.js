import { enqueueSnackbar, closeSnackbar } from 'notistack'
import Button from '@mui/material/Button';
import { sendMessage, cleanCookies } from '../utils'
import store from '../store'
import api from "../utils/api";

export const openRules = [
  {
    match: /getClientState/,
    response: {
      type: 'override',
      override: '{"result":{"proAvailable":true,"updateNecessary":false,"featureSet":{"subscription":{"inactiveSubscriptionWarning":false,"billing":true,"usage":true,"api":true,"isSubaccount":false,"upgradeOptions":[],"signup":false,"management":true,"managedUpAndDowngrades":false,"checkoutForbiddenReasons":[],"newPaymentSystem":false},"support":{"contactForm":false,"tags":[],"openToAnyLoggedIn":false},"translator":{"service":"pro","maxCharactersPerRequest":null,"formality":true},"documentTranslation":{"service":"free","pdf":"ok","formality":true,"maxQuota":null,"sizeLimits":{"docx":5,"htm":0,"html":0,"pdf":5,"pptx":5,"txt":0,"xlf":0,"xliff":0}},"glossary":{"maxEntriesPerGlossary":0,"maxGlossaries":0,"termbaseService":false,"sharing":false,"uploadAndDownload":false},"speech":{"textToSpeech":"yes","speechRecognition":"yes"},"ocr":{"ocr":"yes"},"savedTranslations":{"enabled":true,"savedTranslationsEntryCount":9007199254740991},"translationHistory":{"historyEntryDurationSec":2592000,"historyEntryDuration":{"seconds":2592000,"nanos":0},"accessRight":"yes"},"quickTranslator":{"maxCharactersPerRequest":null},"virality":{"addFooterToCopiedOrSharedText":true},"api":{"manageKeys":true,"service":"pro","catToolsOnly":false,"serviceCatTools":"pro"}},"ep":null,"loginState":{"accountId":"id","ssoIdentityProviderName":null,"ssoIdentityProviderId":null},"notifications":[]},"id":0,"jsonrpc":"2.0"}'
    }
  },
  {
    match: /getCurrentAccount/,
    response: {
      type: 'override',
      override: '{"result":{"accountId":"id","email":"DeepL Crack / Blueagle ❤️","name":"","locale":{"languageCode":"en","countryCode":"  "},"teamName":"DeepL Cracked"},"id":0,"jsonrpc":"2.0"}'
    }
  },
  {
    match: /PHP\/backend\/account.php/,
    response: {
      type: 'override',
      override: '{"jsonrpc":"2.0","result":{"messageCount":"0","activation":{"id":"0","apiKey":"0","characterLimit":"9007199254740991","characterCount":"0","endDate":"2099-01-01","startDate":"2000-01-01","subscriptionId":"2984841","type":"REGULAR","has_billing_data":"1","disabledTime":null,"cancelationTime":null,"additionalCharacterCount":"0","additionalPrice":"0.00","periodStartDate":"2000-01-01","periodEndDate":"2099-01-01","isCurrent":"t","allowChangePayment":true,"allowNewSubscription":false,"settlementId":null,"isTrialPeriod":"t","allowReactivateSubscriptionInTrial":true,"allowRescindCancellation":true,"hasDeletedPaymentToken":"0","isBalanced":true,"trialPeriodUntil":"2099-01-01","period":"DeepL Cracked","allowSeeAccount":true,"showReactivationContent":false,"showRescissionContent":true,"allowChangeKey":true,"isActive":true,"status":"activated on June 1, 2023","statusType":"activated","allowChangeData":true,"allowSeeKey":true,"allowSeeBillingData":true,"allowCancel":false},"subscription":{"id":"2984841","contractConfirmationTime":"2000-01-01 10:21:32.345966+00","billing_period_id":"1","activation_key":"0","type":"REGULAR","currency":"USD","characterLimit":"30000000","cancelationTime":null,"productCode":"silver","productId":"3000","productCharacterLimit":"1000000","price":"0.00","apiKey":"0","addressId":null,"costControl":"0","subscriptionKey":null,"activationKey":"0","isConfirmed":"1","accountLimit":9007199254740991,"documentLimit":9007199254740991,"accountDocumentLimit":9007199254740991,"payment_provider":"STRIPE","payment_provider_id":"20","can_charge":"1","is_invoicing":"0","basicPrice":"0","paymentMethod":"mastercard","card_number_suffix":"1234","expirationDate":"01/2099","remainingDays":"509","refreshLink":null,"clientSecret":null,"subsequentProductId":null,"subsequentBillingPeriodId":null,"subsequentAccountLimit":null,"settlementStartDate":"2023-05-31","settlementEndDate":"2099-01-01","payment_incomplete":"0.00","settlementLastDate":"2099-01-01","includedCharacterCount":"0","ssoIdentityProviderId":null,"supportsAPI":false,"supportsWebTranslator":true,"supportsCatTools":true,"allowsCostControl":false,"customerReference":null,"billingEmail":null,"allowUnlimitedUsers":"f","securityRequestMode":"AUTOMATIC","allowInvoicePayment":false,"allowCreditCardPayment":true,"allowDirectDebitPayment":false,"priceScaleId":"4","paymentMethodSuffix":"1234","expirationDateDescription":"01/2099","settlementStartDateRaw":"2000-01-01","settlementEndDateRaw":"2099-01-01","settlementLastDateRaw":"2099-01-01","isTrialPeriod":"t","isPaymentOverdue":false,"oneTimeSettlementOnUpgrade":{"gross":0,"net":0}},"settlements":[],"address":{},"availableCountries":[],"docConsumption":{"currentUserTranslatedDocuments":0,"currentUserDocumentLimit":9007199254740991,"totalDocumentBudget":9007199254740991,"totalTranslatedDocuments":0},"teamMembership":{"isTeamMember":false,"teamSubscriptionId":false,"teamName":"","teamEmail":"","teamIsActive":false,"isActiveMember":false,"statusText":""},"stripePublicKey":"0","products":{},"vatRates":{},"userPaymentAvailability":{"invoice":"ALLOWED","creditCard":"ALLOWED","directDebit":"ALLOWED"},"account":{"id":"0","email":"DeepL Cracked","tokenAndCredential":"0","name":"DeepL Cracked","accountStatus":990,"isAccountEligibleForFreeTrial":false,"timeout":9007199254740991}},"id":0}'
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
    match: /getPdfFeatureStatus/,
    response: {
      type: 'override',
      override: '{"result":{"status":"noAccountConsent"},"id":0,"jsonrpc":"2.0"}',
    }
  },
  {
    match: /LMT_handle_jobs/,
    changeUrl: {
      type: 'handler',
      handler() {
        if (store.tokensAndCredentialsStore.activeTokenOrCredential?.type === 'DeepLApiFreeToken') {
          return 'https://api-free.deepl.com/v2/translate';
        } else if (store.tokensAndCredentialsStore.activeTokenOrCredential?.type !== 'ProCredential') {
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
          enqueueSnackbar('Reached IP frequency limitation of free web api. You can try again later, use a proxy, or use a tokenAndCredential/seesion in TokenAndCredential Manager. ', {
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
      store.tokensAndCredentialsStore.updateTokenQuota(this.apiToken?.id);
      switch (this.status) {
        case 429:
          enqueueSnackbar('Translation failed due to the IP frequency limitation. Please try again later or use a proxy.', {
            variant: 'error'
          });
          break;
        case 456:
          enqueueSnackbar('The quota of this DeepL Api Free TokenAndCredential has been used up. Please change your tokenAndCredential. ', {
            variant: 'error'
          });
          break;
        case 403:
          enqueueSnackbar('This DeepL Api Free TokenAndCredential is invalid. Please change it. ', {
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
      if (this.status == 400) {
        switch (JSON.parse(this.responseText).error.code) {
          case 800:
            enqueueSnackbar('Translation was blocked due to the limitation. Do you want to clean identifier cookies and try again? (Page will reload). If it still does not work, you need to use a proxy to change your IP and click Clean Cookie Button again.', {
              action: () =>
                <Button
                  onClick={() => {
                    (async () => {
                      try {
                        await cleanCookies();
                        location.reload();
                      } catch (error) {
                        enqueueSnackbar(error.message, { variant: 'error' })
                      }
                    })()
                  }}
                  sx={{ color: 'white' }}
                >
                  Yes
                </Button>,
              variant: 'warning',
              persist: true,
            });
            break;
          case 1101:
            enqueueSnackbar('Your file is too large. Please try again with a smaller file. Hint: You can split your file into smaller ones in the File Manager. (DeepL Crack does not crack this feature due to the server verification)', {
              action: () =>
                <Button
                  onClick={() => {
                    store.windowsStore.toggle('documentsManager')
                  }}
                  sx={{ color: 'white' }}
                >
                  Yes
                </Button>,
              variant: 'warning',
              persist: true,
            });
          case 1103:
            enqueueSnackbar('Your document contains too many characters. Hint: You can split your file into smaller ones in the File Manager or use text translation. (DeepL Crack does not crack this feature due to the server verification)', {
              action: () =>
                <Button
                  onClick={() => {
                    store.windowsStore.toggle('documentsManager')
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
      const { parsedPayload, textLength } = parseAndCheckPayload(this.payload);
      if (textLength > maxTextLength) {
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
        async function fetchTranslation(url, body, controller) {
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
              signal: controller.signal
            });
            switch (r.status) {
              case 200:
                return await r.json();;
              case 429:
                throw new Error('Reached IP frequency limitation of free web api.');
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
        const controller = new AbortController();
        let aborted = false;
        function stop() {
          aborted = true;
          controller.abort();
          closeSnackbar();
          enqueueSnackbar('Translation was stopped because of the timeout, you can try again with a shorter text.', { variant: 'error', persist: true, anchorOrigin: { horizontal: 'right', vertical: 'top' } });
        }
        Object.defineProperty(this, "abort", {
          get: () => stop,
        });
        this.addEventListener('abort', stop);
        this.addEventListener('timeout', stop);
        const batches = splitJobs(parsedPayload.params.jobs);
        let results = [];
        let batchCount = 0;
        for (const batch of batches) {
          if (aborted) {
            break;
          }
          const id = getRandomNumber();
          const body = formatBody(parsedPayload, id, batch);
          try {
            closeSnackbar();
            await new Promise(resolve => setTimeout(resolve, batchCount >= 5 ? 5500 : 100));
            if (batchCount >= 5) {
              enqueueSnackbar('Wait for 5 seconds before sending next batch.', { variant: 'info', persist: true, anchorOrigin: { horizontal: 'right', vertical: 'top' } });
              batchCount = 0;
            }
            const json = await fetchTranslation(this.url, body, controller);
            results.push(json);
            closeSnackbar();
            enqueueSnackbar(`Batch ${batches.indexOf(batch) + 1} of ${batches.length} successfully translated.`, { variant: 'success', persist: true, anchorOrigin: { horizontal: 'right', vertical: 'top' } });
            batchCount++;
          } catch (error) {
            closeSnackbar();
            enqueueSnackbar(`Batch ${batches.indexOf(batch) + 1} of ${batches.length} failed to translate. Reason: ${error.message}`, { variant: 'error', persist: true });
            enqueueSnackbar('You can try again later, use a proxy, or active/deactive a tokenAndCredential/seesion in TokenAndCredential Manager.', { variant: 'info', persist: true });
            enqueueSnackbar('Hint: If you want to request the rest of the translation, you can enter any character in the text box and then delete it.', { variant: 'info', persist: true });
            break;
          }
        }
        if (!aborted) {
          const mergedResult = mergeResults(results);
          overrideProperties.call(this, mergedResult);
        }
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
      this.apiToken = store.tokensAndCredentialsStore.activeTokenOrCredential;
      await sendMessage({
        method: 'setApiToken',
        params: {
          token: this.apiToken?.data.token,
        }
      });
      Object.defineProperty(this, "responseText", {
        get: function () {
          if (this.status !== 200) {
            return `{"jsonrpc":"2.0","error":{"code":0,"message":"Check Your TokenAndCredential"}}`
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
      if (store.tokensAndCredentialsStore.activeTokenOrCredential?.data.useProxy) {
        try {
          const response = await api.fetchTranslation(store.tokensAndCredentialsStore.activeTokenOrCredential.id, this.payload);
          if (/^{"jsonrpc":"2\.0","error":{"code":/.test(response)) {
            throw new Error('INVALID_TOKEN');
          }
          Object.defineProperty(this, "responseText", {
            get: function () {
              return response;
            }.bind(this),
          })
          Object.defineProperty(this, "status", {
            get: () => 200,
          });
        } catch (error) {
          switch (error.message) {
            case 'INVALID_TOKEN':
              enqueueSnackbar('Your credential is invalid', { variant: 'error' });
              break;
            case 'TRANSLATION_FAILED':
              enqueueSnackbar('Translation failed', { variant: 'error' });
              break;
          }
          Object.defineProperty(this, "status", {
            get: () => 400,
          });
        }
        this.DONNOTSEND = true;
        Object.defineProperty(this, "readyState", {
          get: () => this.DONE,
        });
        this.dispatchEvent(new Event('readystatechange'));
      } else {
        await sendMessage({
          method: 'setHeader',
          params: {
            regexFilter: "^https://api\\.deepl\\.com/jsonrpc",
            cookie: store.tokensAndCredentialsStore.activeTokenOrCredential?.data.cookie ?? "",
            ip: store.tokensAndCredentialsStore.activeTokenOrCredential?.data.ip ?? "1.0.0.1",
            userAgent: store.tokensAndCredentialsStore.activeTokenOrCredential?.data.userAgent ?? "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) DeepL/1.15.0 Chrome/91.0.4472.77 Electron/13.1.2 Safari/537.36",
            id: 1
          }
        });
      }
    }
  },
  {
    matchUrl: /backend\.deepl\.com\/documentTranslation\/upload/,
    async await() {
      try {
        await cleanCookies();
        enqueueSnackbar('Cleared cookies', { variant: 'success' });
      } catch (_) {
        enqueueSnackbar('Failed to clear cookies', { variant: 'error' });
      }
      const loading = store.loadingStore.add('Sending clearance request');
      try {
        await fetch("https://clearance.deepl.com/token", {
          "mode": "cors",
          "credentials": "include"
        })
        enqueueSnackbar('Clerance request sent', { variant: 'success' });
      } catch (_) {
        enqueueSnackbar('Clerance request failed', { variant: 'error' });
      }
      store.loadingStore.remove(loading)
    }
  }
]