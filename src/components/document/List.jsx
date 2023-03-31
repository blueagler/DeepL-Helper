import { memo } from 'react'
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import IconButton from '@mui/material/IconButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import ListSubheader from '@mui/material/ListSubheader';
import Task from '@mui/icons-material/Task';
import Delete from '@mui/icons-material/Delete';
import Download from '@mui/icons-material/Download';
import prettyBytes from 'pretty-bytes';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { TransitionGroup } from 'react-transition-group';
import Collapse from '@mui/material/Collapse';

const title = <ListSubheader>Documents</ListSubheader>;

const fileIcon = <ListItemAvatar><Avatar><Task /></Avatar></ListItemAvatar>;

const renderTooltip = (title, onClick, IconComponent) => (
  <Tooltip title={title}>
    <IconButton onClick={onClick}>
      <IconComponent />
    </IconButton>
  </Tooltip>
);

export default memo(function ({ list, handleDeleteDocument, handleDecryptDocument, handleDownloadDocument }) {

  const renderSecondaryAction = (document) => (
    <>
      {renderTooltip("Delete", () => handleDeleteDocument(document?.name), Delete)}
      {renderTooltip("Remove editing restrictions", () => handleDecryptDocument(document), LockOpenIcon)}
      {renderTooltip(`Size: ${prettyBytes(document?.blob?.size ?? 0)}`, () => handleDownloadDocument(document?.blob, document?.name), Download)}
    </>
  );

  return (
    <List
      sx={{
        height: '100%',
        overflowY: 'scroll',
      }}
      subheader={title}
    >
      <TransitionGroup>
        {
          (list ?? []).map((document, key) => (
            <Collapse key={document.name ?? key}>
              <ListItem secondaryAction={renderSecondaryAction(document)}>
                {fileIcon}
                <ListItemText
                  primary={document?.name ?? 'FileName'}
                  secondary={document?.blob?.type ?? 'FileType'}
                />
              </ListItem>
            </Collapse>
          ))
        }
      </TransitionGroup>
    </List>
  )
}, (prevProps, nextProps) => prevProps.list === nextProps.list);
