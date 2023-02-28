import { useCallback, memo, useState, useEffect } from 'react'
import { useLocalObservable, Observer } from 'mobx-react';
import store from 'store';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import List from "./List";
import Popover from '@mui/material/Popover';
import IconButton from '@mui/material/IconButton';
import HelpIcon from '@mui/icons-material/Help';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import api from "utils/api";
import { observe } from 'mobx';
import { enqueueSnackbar } from 'notistack';

const title = <DialogTitle>Token Manager</DialogTitle>;

async function getPublicToken() {
  if (Date.now() - store.cacheStore.getPersistCache('lastGetPublicToken') < 600000) return;
  try {
    await api.getPublicToken();
    store.cacheStore.setPersistCache('lastGetPublicToken', Date.now());
  } catch (e) {
    enqueueSnackbar(`Failed to get public token: ${e.message}`, { variant: 'error' });
  }
}

function Token() {

  const tokenStore = useLocalObservable(() => store.tokenStore);
  const windowStore = useLocalObservable(() => store.windowStore);

  const handleToggleTokenWindow = useCallback(() => windowStore.toggleTokenWindow(), []);

  const [helpPopover, setHelpPopover] = useState(null);

  const handleHelpPopoverOpen = useCallback((event) => {
    setHelpPopover(event.currentTarget);
  }, []);

  const handleHelpPopoverClose = useCallback(() => {
    setHelpPopover(null);
  }, []);

  const [addTokenPopover, setAddTokenPopover] = useState(null);

  const handleAddTokenPopoverOpen = useCallback((event) => {
    setAddTokenPopover(event.currentTarget);
  }, []);

  const handleAddTokenPopoverClose = useCallback(() => {
    setAddTokenPopover(null);
  }, []);

  const [addTokenType, setAddTokenType] = useState('deepl-api-free-token');
  const [addTokenId, setAddTokenId] = useState('');
  const [addToken, setAddToken] = useState('');
  const [addSession, setAddSession] = useState('');

  const handleSetAddTokenType = useCallback((e) => {
    setAddTokenType(e.target.value);
  }, []);

  const handleSetAddTokenId = useCallback((e) => {
    setAddTokenId(e.target.value);
  }, []);

  const handleSetAddToken = useCallback((e) => {
    setAddToken(e.target.value);
  }, []);

  const handleSetAddSession = useCallback((e) => {
    setAddSession(e.target.value);
  }, []);

  const saveToken = useCallback(() => {
    tokenStore.addToken({
      type: addTokenType,
      property: 'private',
      id: addTokenId,
      [addTokenType === 'deepl-api-free-token' ? 'token' : 'session']: addTokenType === 'deepl-api-free-token' ? addToken : addSession,
    });
    handleAddTokenPopoverClose();
    setAddTokenType('deepl-api-free-token');
    setAddTokenId('');
    setAddToken('');
    setAddSession('');
  }, [addTokenType, addToken, addSession]);

  useEffect(() => {
    const isHydratedListener = observe(tokenStore, 'isHydrated', ({ newValue }) => {
      if (newValue) {
        getPublicToken();
        isHydratedListener();
      }
    });
    const visibleListener = document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        getPublicToken();
      }
    })
    return () => {
      document.removeEventListener('visibilitychange', visibleListener);
    }
  }, [])

  return (
    <Observer>{() =>
      <Dialog
        open={windowStore.isTokenWindowOpen ?? false}
        onClose={handleToggleTokenWindow}
        PaperProps={{
          sx: {
            height: '70%',
            minWidth: 400,
          }
        }}
      >
        <IconButton
          size="large"
          sx={{
            position: 'absolute',
            top: 10,
            right: 10
          }}
          onMouseEnter={handleHelpPopoverOpen}
          onMouseLeave={handleHelpPopoverClose}
        >
          <HelpIcon />
        </IconButton>
        <Popover
          sx={{
            pointerEvents: 'none',
          }}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(helpPopover)}
          anchorEl={helpPopover}
          onClose={handleHelpPopoverClose}
          disableRestoreFocus
        >
          <Typography sx={{ p: 1 }}>
            Use DeepL Pro Account Cookies (pro-session)/DeepL Api Free Token to translate. This can help you bypass frequency limitations of web api. DeepL Pro Account Cookies is preferred.
          </Typography>
        </Popover>
        {title}
        <DialogContent>
          <List />
        </DialogContent>
        <DialogActions>
          <Popover
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'center',
            }}
            transformOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
            open={Boolean(addTokenPopover)}
            anchorEl={addTokenPopover}
            onClose={handleAddTokenPopoverClose}
          >
            <Stack
              spacing={2}
              sx={{
                minWidth: 500,
                p: 2
              }}
            >
              <TextField
                select
                label="Type"
                value={addTokenType}
                onChange={handleSetAddTokenType}
                helperText="Please select your token type"
                fullWidth
              >
                <MenuItem value='deepl-api-free-token'>
                  Deepl API Free Token
                </MenuItem>
                <MenuItem value='pro-session'>
                  Deepl Pro Account Session
                </MenuItem>
              </TextField>
              <TextField label="ID" variant="outlined" helperText="This is the name of your token/session" onChange={handleSetAddTokenId} value={addTokenId} />
              {
                addTokenType === 'deepl-api-free-token' ?
                  <TextField label="Token" variant="outlined" helperText="e.g. af10af44-f658-5c9d-f3b0-0c1e0f4b2e6c:fx" onChange={handleSetAddToken} value={addToken} fullWidth /> :
                  <TextField label="Session" variant="outlined" helperText="e.g. 07958060-0c2a-fab4-5de4-4580c63da0e3" onChange={handleSetAddSession} value={addSession} fullWidth />
              }
              <Button variant="contained" onClick={saveToken} disabled={!(addTokenId && ((addTokenType === 'deepl-api-free-token' && addToken) || (addTokenType === 'pro-session' && addSession)))} fullWidth> Save </Button>
            </Stack>
          </Popover>
          <Button onClick={handleAddTokenPopoverOpen}>
            Add your own token or session
          </Button>
          <Button onClick={handleToggleTokenWindow}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    }</Observer>
  )
}

export default memo(Token, () => true);