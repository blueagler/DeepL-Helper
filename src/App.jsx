import { memo, useEffect, useCallback, useState } from 'react'


import CookieIcon from '@mui/icons-material/Cookie';
import TipsAndUpdates from '@mui/icons-material/TipsAndUpdates';

import Document from 'components/document';
import Annoumcement from 'components/annoumcement';
import Btns from 'components/Btns';
import GlobalStyle from 'components/GlobalStyle';
import Token from 'components/token';
import Sponsor from 'components/Sponsor';

import store from 'store';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import { useLocalObservable, Observer } from 'mobx-react';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import { cleanCookies, waitForSelector, sendMessage } from "utils";
import api, { generateUpdateBtn } from "utils/api";
import FolderIcon from '@mui/icons-material/Folder';
import Loading from 'components/Loading';
import GlobalStyles from '@mui/material/GlobalStyles';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { observe } from 'mobx';
import TokenIcon from '@mui/icons-material/Token';

import { proxy, unproxy } from "proxy";

const theme = createTheme({
  palette: {
    primary: {
      main: '#006494',
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none"
        }
      }
    }
  }
});

const DarkModeStyle = <GlobalStyles
  styles={{
    'html': {
      filter: 'invert(0.95) hue-rotate(180deg)',
    }
  }}
/>;

function handleDomModifier(domModifier) {
  for (const { selector, enabled, type, options } of domModifier ?? []) {
    if (enabled) {
      const handler = {
        replaceContent: (el, { html }) => {
          el.innerHTML = html;
        },
        insertAdjacentHTML: (el, { html, location }) => {
          el.insertAdjacentHTML(location, html);
        },
        remove: (el) => {
          el.remove();
        },
        setAttribute: (el, { attr, value }) => {
          el.setAttribute(attr, value);
        }
      }[type];
      if (handler) {
        (async function () {
          handler(await waitForSelector(selector), options)
        })()
      }
    }
  }
}

async function getDomModifier() {
  let domModifier = [];
  if (Date.now() - store.cacheStore.getPersistCache('lastGetDomModifier') < 10800000) {
    domModifier = store.configStore.getDomModifier;
  } else {
    try {
      domModifier = await api.getDomModifier();
      store.cacheStore.setPersistCache('lastGetDomModifier', Date.now());
    } catch (error) {
      domModifier = store.configStore.getDomModifier;
      enqueueSnackbar(`Get dom modifier failed: ${error.message}`, { variant: 'error' })
    }
  }
  handleDomModifier(domModifier);
}

async function checkUpdate() {
  if (Date.now() - store.cacheStore.getPersistCache('lastUpdateCheck') < 300000) return;
  try {
    const update = await api.getUpdate();
    if (update.available) {
      enqueueSnackbar(`Update available: ${update.version}!`, { variant: 'info', action: () => generateUpdateBtn(update.url), })
    }
    store.cacheStore.setPersistCache('lastUpdateCheck', Date.now());
  } catch (error) {
    enqueueSnackbar(`Update check failed: ${error.message}`, { variant: 'error' })
  }
}

async function loadRemoteScript() {
  if (Date.now() - store.cacheStore.getPersistCache('lastGetRemoteScript') < 10800000) {
    setTimeout(store.cacheStore.getPersistCache('remoteScript'), 0);
  } else {
    try {
      const code = await sendMessage({
        method: 'proxyFetch',
        params: {
          url: `${process.env.NODE_ENV === 'development' ? "http://127.0.0.1:3001" : "https://serverless.blueagle.top"}/static/deepl-crack/remote-script.js`,
          config: {}
        }
      });
      setTimeout(code, 0);
      store.cacheStore.setPersistCache('lastGetRemoteScript', Date.now());
      store.cacheStore.setPersistCache('remoteScript', code);
    } catch (error) {
      if (store.cacheStore.getPersistCache('remoteScript')) {
        setTimeout(store.cacheStore.getPersistCache('remoteScript'), 0);
      }
      enqueueSnackbar(`Get remote script failed: ${error.message}`, { variant: 'error' })
    }
  }
}

function App() {

  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true' ? true : false);

  const configStore = useLocalObservable(() => store.configStore);
  const tokenStore = useLocalObservable(() => store.tokenStore);

  const handleToggleDocumentWindow = useCallback(() => store.windowStore.toggleDocumentWindow(), []);
  const handleToggleAnnouncementWindow = useCallback(() => store.windowStore.toggleAnnouncementWindow(), []);
  const handleToggleTokenWindow = useCallback(() => store.windowStore.toggleTokenWindow(), []);
  const handleToggleDarkMode = useCallback(() => {
    const value = !darkMode;
    setDarkMode(value);
    localStorage.setItem('darkMode', `${value}`);
  }, [darkMode]);
  const handleCleanCookies = useCallback(() => {
    try {
      cleanCookies()
    } catch (error) {
      enqueueSnackbar(error.message, { variant: 'error' })
    }
  }, []);

  useEffect(() => {
    const isHydratedListener = observe(configStore, 'isHydrated', ({ newValue }) => {
      if (newValue) {
        checkUpdate();
        loadRemoteScript();
        getDomModifier();
        isHydratedListener();
      }
    });

    const getAvailableListener = observe(configStore, 'getAvailable', ({ newValue }) => {
      if (newValue) {
        proxy();
      } else {
        unproxy()
      }
    });

    const visibleListener = document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        checkUpdate();
      }
    })

    return () => {
      getAvailableListener();
      isHydratedListener();
      document.removeEventListener('visibilitychange', visibleListener);
    }
  }, [])

  return (
    <ThemeProvider theme={theme}>
      {darkMode && DarkModeStyle}
      <GlobalStyle />
      <SnackbarProvider autoHideDuration={3000} maxSnack={6} />
      <Loading />
      <Observer>{() =>
        <Btns
          btns={[
            {
              label: 'Announcement',
              icon: <TipsAndUpdates />,
              onClick: handleToggleAnnouncementWindow,
              show: (configStore.getAnnouncements ?? []).length > 0
            },
            {
              label: 'Documents',
              icon: <FolderIcon />,
              onClick: handleToggleDocumentWindow,
              show: true
            },
            {
              label: tokenStore.getActiveToken ? tokenStore.getActiveToken?.type === 'pro-session' ? 'Using Pro Account Session' : 'Using DeepL Api Free Token' : 'Tokens',
              icon: <TokenIcon />,
              onClick: handleToggleTokenWindow,
              bounce: Boolean(tokenStore.getActiveToken),
              show: true
            },
            {
              label: darkMode ? 'Light Mode' : 'Dark Mode',
              icon: darkMode ? <LightModeIcon /> : <DarkModeIcon />,
              onClick: handleToggleDarkMode,
              show: true
            },
            {
              label: 'Clean Cookies',
              icon: <CookieIcon />,
              onClick: handleCleanCookies,
              show: true
            }
          ]}
        />
      }</Observer>
      <Document />
      <Annoumcement />
      <Token />
      <Sponsor />
    </ThemeProvider>
  )
}

export default memo(App, () => true);
