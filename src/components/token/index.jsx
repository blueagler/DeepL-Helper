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
import api from "utils/api";
import { observe } from 'mobx';

const title = <DialogTitle>Token Manager</DialogTitle>;

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

  useEffect(() => {
    const isHydratedListener = observe(tokenStore, 'isHydrated', ({ newValue }) => {
      if (newValue) {
        api.getPublicToken();
        isHydratedListener();
      }
    });
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
            You can use this window to manage your tokens which enables you to translate using DeepL API and bypass characters and rate limit.
          </Typography>
        </Popover>
        {title}
        <DialogContent>
          <List />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleToggleTokenWindow}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    }</Observer>
  )
}

export default memo(Token, () => true);