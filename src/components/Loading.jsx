import { memo } from 'react'
import { useLocalObservable, Observer } from 'mobx-react';
import store from 'store';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';

const progress = <CircularProgress sx={{ color: 'white', width: '80px!important', height: '80px!important' }} />;

function Loading() {

  const loadingStore = useLocalObservable(() => store.loadingStore);

  return (
    <Observer>{() =>
      <Backdrop
        sx={{ zIndex: 1301 }}
        open={loadingStore.isLoading ?? false}
      >
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={2}
        >
          {progress}
          <Stack
            direction="column"
            justifyContent="center"
            alignItems="center"
            spacing={2}
          >
            {loadingStore.loadingList.map(({ task, id }) => (
              <Paper
                key={id}
                sx={{
                  textAlign: 'center',
                  width: 240,
                  boxShadow: 24,
                  padding: '6px 12px',
                  fontSize: 24,
                  fontWeight: 800,
                  background: 'white',
                  color: (theme) => theme.palette.primary.main
                }}
              >
                {task}
              </Paper>
            ))}
          </Stack>
        </Stack>
      </Backdrop>
    }</Observer>
  )
}

export default memo(Loading, () => true);