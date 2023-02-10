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

const title = <ListSubheader>Documents</ListSubheader>;

const fileIcon = <ListItemAvatar><Avatar><Task /></Avatar></ListItemAvatar>;

export default memo(function ({ list, handleDeleteDocument, handleDecryptDocument, handleDownloadDocument }) {

  return (
    <List
      sx={{
        height: '100%',
        overflowY: 'scroll',
      }}
      subheader={title}
    >
      {
        (list ?? []).map((document, key) => (
          <ListItem
            key={document.name ?? key}
            secondaryAction={
              <>
                <Tooltip title="Delete">
                  <IconButton onClick={() => handleDeleteDocument(document?.name)}>
                    <Delete />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Remove editing restrictions">
                  <IconButton onClick={() => handleDecryptDocument(document)}>
                    <LockOpenIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={`Size: ${prettyBytes(document?.blob?.size ?? 0)}`}>
                  <IconButton onClick={() => handleDownloadDocument(document?.blob, document?.name)}>
                    <Download />
                  </IconButton>
                </Tooltip>
              </>
            }
          >
            {fileIcon}
            <ListItemText
              primary={document?.name ?? 'FileName'}
              secondary={document?.blob?.type ?? 'FileType'}
            />
          </ListItem>
        ))
      }
    </List>
  )
}, (prevProps, nextProps) => prevProps.list === nextProps.list);