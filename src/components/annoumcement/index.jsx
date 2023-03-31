import { useCallback, memo, useEffect } from 'react'
import { useLocalObservable, Observer } from 'mobx-react';
import store from 'store';

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
import api from "utils/api";
import { observe } from 'mobx';
import { enqueueSnackbar } from 'notistack';

const title = <Typography
  align='center'
  sx={{
    fontSize: 40,
    margin: '15px'
  }} >
  Announcement
</Typography>;

async function getAnnouncement() {
  if (Date.now() - store.cacheStore.getPersistCache('lastGetAnnouncement') < 10800000) return;
  try {
    await api.getAnnouncement();
    store.cacheStore.setPersistCache('lastGetAnnouncement', Date.now());
  } catch (e) {
    enqueueSnackbar(`Failed to get announcement: ${e.message}`, { variant: 'error' });
  }
}

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
          {announcement.type ?? 'Announcement'}
        </Typography>
        <Typography variant="h5" component="div">
          {announcement.title ?? 'Title'}
        </Typography>
        <Typography sx={{
          mb: 1.5,
          whiteSpace: 'pre-wrap'
        }} color="text.secondary">
          {announcement.secondary ?? 'Secondary'}
        </Typography>
        <Typography variant="body2"
          sx={{
            whiteSpace: 'pre-wrap'
          }}
        >
          {announcement.description ?? 'Description'}
        </Typography>
      </CardContent>
      <CardActions>
        {
          (announcement.links ?? []).map((link, key) =>
            <Button size="small" component='a' target='_blank' href={link.href ?? ''} key={link.label ?? key}>{link.label ?? 'Label'}</Button>
          )
        }
      </CardActions>
    </Card>
  );
}

function Announcement() {

  const configStore = useLocalObservable(() => store.configStore);
  const windowStore = useLocalObservable(() => store.windowStore);

  const handleToggleAnnouncementWindow = useCallback(() => windowStore.toggleAnnouncementWindow(), []);

  useEffect(() => {
    const isHydratedListener = observe(configStore, 'isHydrated', ({ newValue }) => {
      if (newValue) {
        getAnnouncement();
        isHydratedListener();
      }
    });
    const visibleListener = document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        getAnnouncement();
      }
    })
    return () => {
      isHydratedListener();
      document.removeEventListener('visibilitychange', visibleListener);
    }
  }, [])


  return (
    <Observer>{() =>
      <Drawer
        anchor='right'
        open={windowStore.isAnnouncementWindowOpen ?? false}
        onClose={handleToggleAnnouncementWindow}
        PaperProps={{
          sx: {
            backgroundColor: 'grey.100',
            maxWidth: '800px',
          }
        }}
      >
        {title}
        <IconButton
          size="large"
          sx={{
            position: 'fixed',
            zIndex: 1,
            top: 20,
            right: 20
          }}
          onClick={handleToggleAnnouncementWindow}
        >
          <CloseIcon />
        </IconButton>
        <Stack
          divider={<Divider orientation="vertical" flexItem />}
          spacing={2}
        >
          {
            (configStore.getAnnouncements ?? []).map((announcement, key) =>
              <AnnouncementCard key={announcement.id ?? key} announcement={announcement} />
            )
          }
        </Stack>
      </Drawer>
    }</Observer>
  )
}

export default memo(Announcement, () => true);
