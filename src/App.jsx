import { memo } from 'react'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import { LicenseInfo } from '@mui/x-license-pro';

import DocumentsManager from './components/DocumentsManager';
import Announcements from './components/Announcements';
import Banners from './components/Banners';
import GlobalStyle from './components/GlobalStyle';
import TokensAndCredentialsManager from './components/TokensAndCredentialsManager';
import Sponsor from './components/Sponsor';
import Loading from './components/Loading';
import Guide from './components/Guide';

LicenseInfo.setLicenseKey("63cdcff003c86a961f1b47b5703dd5e0Tz0wLEU9MjUzNDA0ODY0MDAwMDAwLFM9cHJlbWl1bSxMTT1zdWJzY3JpcHRpb24sS1Y9Mg==");

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

export default memo(function () {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <SnackbarProvider autoHideDuration={3000} maxSnack={6} />
      <Sponsor />
      <Loading />
      <Banners />
      <DocumentsManager />
      <Announcements />
      <TokensAndCredentialsManager />
      <Guide />
    </ThemeProvider>
  )
}, () => true)
