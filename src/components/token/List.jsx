import { memo } from 'react'
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

  return (
    <Observer>
      {() =>
        <>
          {tokenStore.getActiveId?.id &&
            <ListItem
              key={tokenStore.getActiveId?.id}
              secondaryAction={
                <Tooltip title="Stop using this">
                  <IconButton onClick={() => tokenStore.setActiveId(null)}>
                    <RemoveIcon />
                  </IconButton>
                </Tooltip>
              }
            >
              {tokenIcon}
              <ListItemText
                primary={`Using ${tokenStore.getActiveId?.id} (${tokenStore.getActiveId?.type})`}
                secondary={tokenStore.getActiveId?.validCharacter ? `Valid character: ${tokenStore.getActiveId?.validCharacter}` : null}
                sx={{
                  animation: 'DeepL-Crack-Bounce-Animation 3s ease-in-out infinite'
                }}
              />
            </ListItem>
          }
          <List
            sx={{
              height: `${tokenStore.getActiveId?.id ? 85 : 100}%`,
              overflowY: 'scroll',
            }}
            subheader={title}
          >
            {(tokenStore.tokens ?? []).map((token, key) => (
              <ListItem
                key={token?.id ?? key}
                secondaryAction={
                  <>
                    {
                      token?.property === 'private' ?
                        <Tooltip title="Delete this">
                          <IconButton onClick={() => tokenStore.deleteId(token?.id)}>
                            <RemoveIcon />
                          </IconButton>
                        </Tooltip> : null
                    }
                    <Tooltip title='Use this'>
                      <IconButton onClick={() => tokenStore.setActiveId(token?.id)}>
                        <AddIcon />
                      </IconButton>
                    </Tooltip>
                  </>
                }
              >
                {tokenIcon}
                <ListItemText
                  primary={`${token?.id} (${token?.type})`}
                  secondary={token?.validCharacter ? `Valid character: ${token?.validCharacter}` : null}
                />
              </ListItem>
            ))}
          </List>
        </>
      }
    </Observer>
  )
}, () => true);