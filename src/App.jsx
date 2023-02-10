import { memo, useEffect, useCallback, useState } from 'react'


import CookieIcon from '@mui/icons-material/Cookie';
import TipsAndUpdates from '@mui/icons-material/TipsAndUpdates';

import Document from 'components/document';
import Annoumcement from 'components/annoumcement';
import Btns from 'components/Btns';
import GlobalStyle from 'components/GlobalStyle';
import Token from 'components/token';

import store from 'store';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import { useLocalObservable, Observer } from 'mobx-react';
import { SnackbarProvider, enqueueSnackbar } from 'notistack';
import { cleanCookies, waitForSelector } from "utils";
import api from "utils/api";
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

function loadDomModifier() {
  api.getDomModifier()
    .then(domModifier => {
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
    })
}

function App() {

  const [darkMode, setDarkMode] = useState(false);

  const configStore = useLocalObservable(() => store.configStore);
  const tokenStore = useLocalObservable(() => store.tokenStore);

  const handleToggleDocumentWindow = useCallback(() => store.windowStore.toggleDocumentWindow(), []);
  const handleToggleAnnouncementWindow = useCallback(() => store.windowStore.toggleAnnouncementWindow(), []);
  const handleToggleTokenWindow = useCallback(() => store.windowStore.toggleTokenWindow(), []);
  const handleToggleDarkMode = useCallback(() => setDarkMode(!darkMode), [darkMode]);
  const handleCleanCookies = useCallback(() => {
    try {
      cleanCookies()
    } catch (error) {
      enqueueSnackbar(error.message, { variant: 'error' })
    }
  }, []);

  useEffect(() => {

    const checkInterval = setInterval(api.getAvailable, 300000);
    const isHydratedListener = observe(configStore, 'isHydrated', ({ newValue }) => {
      if (newValue) {
        loadDomModifier();
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

    return () => {
      getAvailableListener();
      clearInterval(checkInterval);
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
              label: !!tokenStore.getActiveToken ? 'Token Actived' : 'Tokens',
              icon: <TokenIcon />,
              onClick: handleToggleTokenWindow,
              bounce: !!tokenStore.getActiveToken,
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
    </ThemeProvider>
  )
}

export default memo(App, () => true);