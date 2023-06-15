import { useCallback, memo } from 'react'
import { useLocalObservable, Observer } from 'mobx-react';

import Drawer from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardActions from '@mui/material/CardActions';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

import store from '../store';

const title = <Typography align='center' sx={{ fontSize: 40, margin: '15px' }}>Announcements</Typography>;

function AnnouncementCard({ announcement }) {
  return (
    <Card
      key={announcement.id}
      sx={{
        margin: '0 15px!important',
      }}
    >
      <CardContent>
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          {announcement.type}
        </Typography>
        <Typography variant="h5" component="div">
          {announcement.title}
        </Typography>
        <Typography variant="body2"
          sx={{
            whiteSpace: 'pre-wrap'
          }}
        >
          {announcement.content}
        </Typography>
      </CardContent>
      <CardActions>
        {
          (announcement.links).map((link, key) =>
            <Button size="small" component='a' target='_blank' href={link.href ?? ''} key={link.label ?? key}>{link.label ?? 'Label'}</Button>
          )
        }
      </CardActions>
    </Card>
  );
}

export default memo(function () {
  const configStore = useLocalObservable(() => store.configStore);
  const windowsStore = useLocalObservable(() => store.windowsStore);
  const handleToggleWindow = useCallback(() => windowsStore.toggle('announcements'), []);

  return (
    <Observer>
      {() => (
        <Drawer
          anchor='right'
          open={windowsStore.getAnnouncements}
          onClose={handleToggleWindow}
          PaperProps={{ sx: { backgroundColor: 'grey.100', maxWidth: '800px' } }}
          id='dc-announcements'
        >
          {title}
          <IconButton
            size="large"
            sx={{ position: 'fixed', zIndex: 1, top: 20, right: 20 }}
            onClick={handleToggleWindow}
          >
            <CloseIcon />
          </IconButton>
          <Stack divider={<Divider orientation="vertical" flexItem />} spacing={2} id="dc-announcements">
            {(configStore.getAnnouncements ?? []).map((announcement, key) => (
              <AnnouncementCard key={announcement.id ?? key} announcement={announcement} />
            ))}
          </Stack>
        </Drawer>
      )}
    </Observer>
  );
}, () => true);
