import { memo, useCallback, useMemo } from 'react'
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
import { TransitionGroup } from 'react-transition-group';
import Collapse from '@mui/material/Collapse';

const title = <ListSubheader>Tokens</ListSubheader>;

const tokenIcon = <ListItemAvatar><Avatar><TokenIcon /></Avatar></ListItemAvatar>;

const SecondaryAction = memo(function ({ id, property, isActived, tokenStore }) {
  const handleDelete = useCallback(() => {
    tokenStore.deleteId(id);
  }, [id]);

  const handleToggle = useCallback(() => {
    tokenStore.setActiveId(isActived ? null : id);
  }, [id]);

  return <>
    {
      property === 'local' && !isActived ?
        <Tooltip title="Remove this token/session">
          <IconButton onClick={handleDelete}>
            <RemoveIcon />
          </IconButton>
        </Tooltip> : null
    }
    <Tooltip title={`${isActived ? 'Stop using' : 'Use'} this token/session`}>
      <IconButton onClick={handleToggle}>
        {
          isActived ?
            <RemoveIcon /> :
            <AddIcon />
        }
      </IconButton>
    </Tooltip>
  </>
}, (prev, next) => prev.isActived === next.isActived);

const TokenItem = memo(function ({ token, tokenStore }) {

  const isActived = useMemo(() => token.id === tokenStore.getActiveToken?.id, [tokenStore.getActiveToken?.id]);

  return <ListItem
    key={token.id}
    secondaryAction={<SecondaryAction isActived={isActived} id={token.id} property={token.property} tokenStore={tokenStore} />}
    sx={{
      animation: token.id === tokenStore.getActiveToken?.id ? 'DeepL-Crack-Bounce-Animation 2s infinite' : 'none',
    }}
  >
    {tokenIcon}
    <ListItemText
      primary={`${token.name ?? token.id} (${token.type})`}
      secondary={`Status: ${token.status} ${token.validCharacter ? `; Valid character: ${token.validCharacter}` : ''}`}
    />
  </ListItem>
});

export default memo(function () {
  const tokenStore = useLocalObservable(() => store.tokenStore);
  return (
    <Observer>
      {() =>
        <>
          {
            tokenStore.tokens?.filter((token) => token?.status === 'valid' ?? false).length === 0 ?
              "No token found. Please add one." :
              <>
                {tokenStore.getActiveToken &&
                  <TokenItem token={tokenStore.getActiveToken} tokenStore={tokenStore} />
                }
                <List
                  sx={{
                    height: `${tokenStore.getActiveToken ? 85 : 100}%`,
                    overflowY: 'scroll',
                  }}
                  subheader={title}
                >
                  <TransitionGroup>
                    {tokenStore.tokens
                      .filter((token) => token?.status === 'valid' ?? false)
                      .filter((token) => token.id !== tokenStore.getActiveToken?.id)
                      .map((token) => <Collapse key={token.id}>
                        <TokenItem token={token} tokenStore={tokenStore} />
                      </Collapse>)}
                  </TransitionGroup>
                </List>
              </>
          }
        </>
      }
    </Observer>
  )
}, () => true);
