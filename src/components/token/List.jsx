import { memo, useCallback } from 'react'
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import IconButton from '@mui/material/IconButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import ListSubheader from '@mui/material/ListSubheader';
import TokenIcon from '@mui/icons-material/Token';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useLocalObservable, Observer } from 'mobx-react';
import store from 'store';

const title = <ListSubheader>Tokens</ListSubheader>;

const tokenIcon = <ListItemAvatar><Avatar><TokenIcon /></Avatar></ListItemAvatar>;

export default memo(function () {

  const tokenStore = useLocalObservable(() => store.tokenStore);

  const handleUseToken = useCallback((token) => {
    tokenStore.setActiveId(token.id);
  }, []);

  return (
    <Observer>
      {() =>
        <>
          {tokenStore.getActiveToken?.token &&
            <ListItem
              key={tokenStore.getActiveToken?.token}
              secondaryAction={
                <Tooltip title="Stop using this token">
                  <IconButton onClick={() => handleUseToken({ id: null })}>
                    <RemoveIcon />
                  </IconButton>
                </Tooltip>
              }
            >
              {tokenIcon}
              <ListItemText
                primary={`You are currently using ${tokenStore.getActiveToken?.id} (${tokenStore.getActiveToken?.type})`}
                secondary={`Valid character: ${tokenStore.getActiveToken?.validCharacter}`}
                sx={{
                  animation: 'DeepL-Crack-Bounce-Animation 3s ease-in-out infinite'
                }}
              />
            </ListItem>
          }
          <List
            sx={{
              height: `${tokenStore.getActiveToken?.token ? 85 : 100}%`,
              overflowY: 'scroll',
            }}
            subheader={title}
          >
            {(tokenStore.tokens ?? []).map((token, key) => (
              <ListItem
                key={token?.token ?? key}
                secondaryAction={
                  <Tooltip title="Use this token">
                    <IconButton onClick={() => handleUseToken(token)}>
                      <AddIcon />
                    </IconButton>
                  </Tooltip>
                }
              >
                {tokenIcon}
                <ListItemText
                  primary={`${token?.id} (${token?.type})`}
                  secondary={`Valid character: ${token?.validCharacter}`}
                />
              </ListItem>
            ))}
          </List>
        </>
      }
    </Observer>
  )
}, () => true);