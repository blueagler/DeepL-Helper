import { memo, useEffect, useCallback, useState, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import Fab from '@mui/material/Fab';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Portal from '@mui/base/Portal';
import TokenIcon from '@mui/icons-material/Token';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import FolderIcon from '@mui/icons-material/Folder';
import CookieIcon from '@mui/icons-material/Cookie';
import TipsAndUpdates from '@mui/icons-material/TipsAndUpdates';
import GlobalStyles from '@mui/material/GlobalStyles';
import { useLocalObservable } from 'mobx-react';
import injectAnalytics from '../utils/injectAnalytics';
import { waitForSelector, cleanCookies } from '../utils';
import store from '../store';
import { enqueueSnackbar } from 'notistack';

const Wrapper = styled(Stack)({
  float: 'right',
  '@media (max-width: 840px)': {
    float: 'initial',
    width: '100%',
    marginBottom: '24px'
  }
});
function createContainerElement() {
  const div = document.createElement('div');
  injectAnalytics();
  return div;
}
const DarkModeStyle = <GlobalStyles
  styles={{
    'html': {
      filter: 'invert(0.95) hue-rotate(180deg)',
    }
  }}
/>;
export default memo(function () {
  const [container, setContainer] = useState(false);
  const activeTokenOrCredential = useLocalObservable(() => store.tokensAndCredentialsStore.activeTokenOrCredential);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');

  const handleToggleAnnouncements = useCallback(() => store.windowsStore.toggle('announcements'), []);
  const handleToggleDocumentsManager = useCallback(() => store.windowsStore.toggle('documentsManager'), []);
  const handleToggleTokensAndCredentialsManager = useCallback(() => store.windowsStore.toggle('tokensAndCredentialsManager'), []);

  const handleToggleDarkMode = useCallback(() => {
    setDarkMode(!darkMode);
    localStorage.setItem('darkMode', `${!darkMode}`);
  }, [darkMode]);
  const handleCleanCookies = useCallback(async () => {
    try {
      await cleanCookies();
      location.reload();
    } catch (error) {
      enqueueSnackbar(error.message, { variant: 'error' })
    }
  }, []);
  useEffect(() => {
    waitForSelector('#dl_translator')
      .then((el) => {
        const div = createContainerElement();
        el.prepend(div);
        setContainer(div);
      });
  }, []);
  const buttons = useMemo(() => [
    { label: 'Announcements', icon: <TipsAndUpdates />, onClick: handleToggleAnnouncements },
    { label: 'Documents Manager', icon: <FolderIcon />, onClick: handleToggleDocumentsManager },
    {
      label: !!activeTokenOrCredential?.type ? `Using ${activeTokenOrCredential.type}` : 'Tokens and Credentials Manager',
      icon: <TokenIcon />, onClick: handleToggleTokensAndCredentialsManager
    },
    { label: 'Clean Cookies', icon: <CookieIcon />, onClick: handleCleanCookies, id: 'dc-clean-cookies' },
    {
      label: darkMode ? 'Light Mode' : 'Dark Mode',
      icon: darkMode ? <LightModeIcon /> : <DarkModeIcon />,
      onClick: handleToggleDarkMode,
      id: 'dc-dark-mode'
    }
  ], [activeTokenOrCredential, darkMode]);
  return (<>
    {darkMode && DarkModeStyle}
    {
      !!container ? <Portal container={container}>
        <Wrapper
          direction="row"
          divider={<Divider orientation="vertical" flexItem />}
          spacing={2}
          justifyContent="space-evenly"
          id='dc-banners'
        >
          {buttons.map(({ label, icon, onClick, visible = true, id }) => visible && (
            <Tooltip key={label} title={label} arrow>
              <Fab onClick={onClick} color="primary" aria-label={label} id={id}>
                {icon}
              </Fab>
            </Tooltip>
          ))}
        </Wrapper>
      </Portal> : null
    }
  </>)
}, () => true);