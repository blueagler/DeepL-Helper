import React, { useCallback, memo, useState } from 'react';
import { Observer, useLocalObservable } from 'mobx-react';

import store from '../../store';
import api from "../../utils/api";
import { uuid } from '../../utils'
import { enqueueSnackbar } from 'notistack';

import { DataGridPremium, GridActionsCellItem } from '@mui/x-data-grid-premium';

import AddIcon from '@mui/icons-material/Add';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Popover from '@mui/material/Popover';
import IconButton from '@mui/material/IconButton';
import RemoveIcon from '@mui/icons-material/Remove';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import RefreshIcon from '@mui/icons-material/Refresh';

import HelpButton from '../HelpButton';

const title = <DialogTitle>Tokens And Credentials Manager</DialogTitle>;

export default memo(function () {
  const tokensAndCredentialsStore = useLocalObservable(() => store.tokensAndCredentialsStore);
  const windowsStore = useLocalObservable(() => store.windowsStore);
  const handleToggleWindow = useCallback(() => windowsStore.toggle('tokensAndCredentialsManager'), []);

  const [addTokenOrCredentialState, setAddTokenOrCredentialState] = useState({
    form: {
      type: 'DeepLApiFreeToken',
      name: '',
      licensing: 'LOCAL',
      DeepLApiFreeToken: {
        token: '',
        character_count: 0,
        character_limit: 0,
      },
      ProCredential: {
        cookies: '',
        ip: '',
        userAgent: '',
        useProxy: false
      }
    },
    popover: null,
  });

  const handleCopyUUID = useCallback(() => {
    navigator.clipboard.writeText(tokensAndCredentialsStore.getUUID)
      .then(() => enqueueSnackbar('UUID copied to clipboard', { variant: 'success' }))
      .catch(() => alert(`Failed to copy UUID: ${tokensAndCredentialsStore.getUUID}`));
  }, [tokensAndCredentialsStore.getUUID]);

  const handleRefreshTokensAndCredentials = useCallback(() => {
    api.getTokensAndCredentials()
      .then(() => {
        store.cacheStore.set('lastGetToken', Date.now(), true);
        enqueueSnackbar('Token refreshed', { variant: 'success' })
      });
  }, []);

  const handleSetFormField = useCallback((field, value) => {
    setAddTokenOrCredentialState((prevState) => ({
      ...prevState,
      form: {
        ...prevState.form,
        [field]: value,
      },
    }));
  }, []);

  const handleSaveTokenOrCredential = useCallback(() => {
    tokensAndCredentialsStore.addToken({
      ...addTokenOrCredentialState,
      id: uuid(),
      data: addTokenOrCredentialState[addTokenOrCredentialState.type],
    });
  }, [addTokenOrCredentialState]);

  const handleAddTokenOrCredentialPopoverOpen = useCallback((e) => {
    setAddTokenOrCredentialState((prevState) => ({
      ...prevState,
      popover: e.currentTarget,
    }));
  }, []);

  const handleAddTokenOrCredentialPopoverClose = useCallback(() => {
    setAddTokenOrCredentialState((prevState) => ({
      ...prevState,
      popover: null,
    }));
  }, []);

  const fieldConfig = {
    type: {
      label: 'Type',
      options: [
        { value: 'DeepLApiFreeToken', label: 'Deepl API Free Token' },
        { value: 'ProCredential', label: 'Deepl Pro Account Credential' },
      ],
    },
    name: {
      label: 'Name',
    },
    'DeepLApiFreeToken.token': {
      label: 'Token',
      helperText: 'This is your DeepL Api Free Token',
    },
    'ProCredential.cookies': {
      label: 'Cookie',
    },
    'ProCredential.ip': {
      label: 'IP',
    },
    'ProCredential.userAgent': {
      label: 'User Agent',
    },
  };

  return (
    <Observer>
      {() => (
        <Dialog
          open={windowsStore.getTokensAndCredentialsManager}
          onClose={handleToggleWindow}
          PaperProps={{
            sx: {
              height: '70%',
              width: '950px',
              maxWidth: '90%',
            },
          }}
        >
          <Stack
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
            }}
            direction="row"
          >
            <IconButton size="large" onClick={handleRefreshTokensAndCredentials}>
              <RefreshIcon />
            </IconButton>
            <HelpButton
              content="
              You can use DeepL Pro Credential/DeepL Api Free Token to translate. This can help you bypass frequency limitations of web api.
              Some free public resources may be provided. You can also add your own tokens/credentials.
              If you sponsor me, I may provide you some private tokens/credentials for you. Rememer to DM me on Telegram(@Blueagler) or Email(austinliu@blueagle.top) and remain your email address and UUID when you sponsor me.
              "
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            />
          </Stack>
          {title}
          <DialogContent id="dc-tokens-and-credentials-manager">
            <DataGridPremium
              columns={[
                { field: 'id' },
                { field: 'left', headerName: 'Available Characters', width: 200 },
                { field: 'name', headerName: 'Name', minWidth: 250 },
                { field: 'type', headerName: 'Type', minWidth: 200 },
                { field: 'license', headerName: 'License', width: 100 },
                {
                  field: 'actions',
                  type: 'actions',
                  headerName: 'Use / Disuse',
                  getActions: (params) => [
                    <GridActionsCellItem
                      label={`${params.row.id === tokensAndCredentialsStore.activeTokenOrCredential?.id ? 'Disuse' : 'Use'} this token`}
                      icon={
                        <Tooltip title={`${params.row.id === tokensAndCredentialsStore.activeTokenOrCredential?.id ? 'Disuse' : 'Use'} this token`}>
                          {params.row.id === tokensAndCredentialsStore.activeTokenOrCredential?.id ? <RemoveIcon /> : <AddIcon />}
                        </Tooltip>
                      }
                      onClick={() => tokensAndCredentialsStore.setActiveId(params.row.id === tokensAndCredentialsStore.activeTokenOrCredential?.id ? null : params.row.id)}
                    />,
                  ],
                  width: 150,
                },
              ]}
              columnVisibilityModel={{ id: false }}
              rows={tokensAndCredentialsStore.list.map(({ id, data, type, name, licensing }) => ({
                id,
                left: data.character_limit ? data.character_limit - data.character_count > 0 ? data.character_limit - data.character_count : 0 : 'Unlimited',
                type,
                name,
                license: licensing,
              }))}
              initialState={{
                sorting: {
                  sortModel: [{ field: 'left', sort: 'desc' }],
                },
              }}
              pinnedColumns={{ right: ['actions'] }}
              pinnedRows={tokensAndCredentialsStore.activeTokenOrCredential ? { top: [tokensAndCredentialsStore.activeTokenOrCredential] } : {}}
            />
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
              open={Boolean(addTokenOrCredentialState.popover)}
              anchorEl={addTokenOrCredentialState.popover}
              onClose={handleAddTokenOrCredentialPopoverClose}
            >
              <Stack
                spacing={2}
                sx={{
                  minWidth: 500,
                  p: 2,
                }}
              >
                {Object.entries(fieldConfig).map(([field, config]) => (
                  <TextField
                    key={field}
                    label={config.label}
                    variant="outlined"
                    helperText={config.helperText}
                    value={field.includes('.') ? addTokenOrCredentialState.form[field.split('.')[0]][field.split('.')[1]] : addTokenOrCredentialState.form[field]}
                    onChange={(e) =>
                      handleSetFormField(
                        field.includes('.') ? field.split('.')[0] : field,
                        field.includes('.')
                          ? {
                            ...addTokenOrCredentialState.form[field.split('.')[0]],
                            [field.split('.')[1]]: e.target.value,
                          }
                          : e.target.value
                      )
                    }
                  />
                ))}
                <Button variant="contained" onClick={handleSaveTokenOrCredential} />
              </Stack>
            </Popover>
            <Button onClick={handleCopyUUID}>Copy your UUID</Button>
            <Button onClick={handleAddTokenOrCredentialPopoverOpen}>Add your own token or session</Button>
            <Button onClick={handleToggleWindow}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </Observer>
  );
}, () => true);
