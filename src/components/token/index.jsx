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
import RefreshIcon from '@mui/icons-material/Refresh';
import { uuid } from 'utils'

const title = <DialogTitle>Token Manager</DialogTitle>;

async function getToken() {
  if (Date.now() - store.cacheStore.getPersistCache('lastGetToken') < 600000) return;
  try {
    await api.getToken();
    store.cacheStore.setPersistCache('lastGetToken', Date.now());
  } catch (e) {
    enqueueSnackbar(`Failed to get token: ${e.message}`, { variant: 'error' });
  }
}

function handlePopoverOpen(setPopover) {
  return useCallback((event) => {
    setPopover(event.currentTarget);
  }, []);
}

function handlePopoverClose(setPopover) {
  return useCallback(() => {
    setPopover(null);
  }, []);
}

const NewTokenModel = memo(function ({ handleAddTokenPopoverClose, addTokenPopover, tokenStore }) {
  const [addTokenType, setAddTokenType] = useState('deepl-api-free-token');
  const [addTokenName, setAddTokenName] = useState('');
  const [addToken, setAddToken] = useState('');
  const handleSetAddTokenType = useCallback((e) => {
    setAddTokenType(e.target.value);
  }, []);
  const handleSetAddTokenName = useCallback((e) => {
    setAddTokenName(e.target.value);
  }, []);
  const handleSetAddToken = useCallback((e) => {
    setAddToken(e.target.value);
  }, []);
  const saveToken = useCallback(() => {
    tokenStore.addToken({
      type: addTokenType,
      property: 'local',
      id: uuid(),
      name: addTokenName,
      status: 'valid',
      [addTokenType === 'deepl-api-free-token' ? 'token' : 'session']: addToken,
    });
    handleAddTokenPopoverClose();
    setAddTokenType('deepl-api-free-token');
    setAddTokenName('');
    setAddToken('');
  }, [addTokenType, addToken]);

  return (
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
        <TextField label="Name" variant="outlined" helperText="This is the name of your token/session" onChange={handleSetAddTokenName} value={addTokenName} />
        <TextField
          label={addTokenType === 'deepl-api-free-token' ? 'Token' : 'Session'}
          variant="outlined"
          helperText={addTokenType === 'deepl-api-free-token' ? "e.g. af10af44-f658-5c9d-f3b0-0c1e0f4b2e6c:fx" : "e.g. 07958060-0c2a-fab4-5de4-4580c63da0e3"}
          onChange={handleSetAddToken}
          value={addToken}
          fullWidth />
        <Button variant="contained" onClick={saveToken} disabled={!(addTokenName && addToken)} fullWidth> Save </Button>
      </Stack>
    </Popover>
  )
}, (prev, next) => prev.addTokenPopover === next.addTokenPopover);

const Help = memo(function ({ helpPopover, handleHelpPopoverClose }) {
  return (
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
        Using DeepL Pro Account Cookies (pro-session)/DeepL Api Free Token to translate can help you bypass frequency limitations of free web api.
        Sometimes I provide public tokens for free, but they are not guaranteed to be valid forever.
        You can also use your own tokens/sessions.
        I may provide you some private tokens/sessions for you.
        DM me on Telegram(@Blueagler) or Email(austinliu@blueagle.top).
      </Typography>
    </Popover>
  )
}, (prev, next) => prev.helpPopover === next.helpPopover);

function Token() {

  const tokenStore = useLocalObservable(() => store.tokenStore);
  const windowStore = useLocalObservable(() => store.windowStore);

  const handleToggleTokenWindow = useCallback(() => windowStore.toggleTokenWindow(), []);

  const [helpPopover, setHelpPopover] = useState(null);
  const handleHelpPopoverOpen = handlePopoverOpen(setHelpPopover);
  const handleHelpPopoverClose = handlePopoverClose(setHelpPopover);

  const [addTokenPopover, setAddTokenPopover] = useState(null);
  const handleAddTokenPopoverOpen = handlePopoverOpen(setAddTokenPopover);
  const handleAddTokenPopoverClose = handlePopoverClose(setAddTokenPopover);

  const handleCopyUUID = useCallback(() => {
    navigator.clipboard.writeText(tokenStore.getUUID)
      .then(() => enqueueSnackbar('UUID copied to clipboard', { variant: 'success' }))
      .catch(() => alert(`Failed to copy UUID: ${tokenStore.getUUID}`));
  }, [tokenStore.getUUID]);

  const handleRefreshToken = useCallback(() => {
    api.getToken()
      .then(() => {
        store.cacheStore.setPersistCache('lastGetToken', Date.now());
        enqueueSnackbar('Token refreshed', { variant: 'success' })
      });
  }, []);

  useEffect(() => {
    const isHydratedListener = observe(tokenStore, 'isHydrated', ({ newValue }) => {
      if (newValue) {
        getToken();
        isHydratedListener();
      }
    });
    const visibleListener = document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        getToken();
      }
    })
    return () => {
      isHydratedListener();
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
        <Stack
          sx={{
            position: 'absolute',
            top: 10,
            right: 10
          }}
          direction="row"
        >
          <IconButton
            size="large"
            onClick={handleRefreshToken}
          >
            <RefreshIcon />
          </IconButton>
          <IconButton
            size="large"
            onMouseEnter={handleHelpPopoverOpen}
            onMouseLeave={handleHelpPopoverClose}
          >
            <HelpIcon />
          </IconButton>
        </Stack>
        <Help helpPopover={helpPopover} handleHelpPopoverClose={handleHelpPopoverClose} />
        {title}
        <DialogContent>
          <List />
        </DialogContent>
        <DialogActions>
          <NewTokenModel
            addTokenPopover={addTokenPopover}
            handleAddTokenPopoverClose={handleAddTokenPopoverClose}
            tokenStore={tokenStore}
          />
          <Button onClick={handleCopyUUID}>
            Copy your UUID
          </Button>
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
