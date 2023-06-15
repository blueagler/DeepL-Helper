import React, { useCallback, memo } from 'react';
import { useLocalObservable, Observer } from 'mobx-react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import FileUploader from './FileUploader';
import { DataGridPremium, GridActionsCellItem } from '@mui/x-data-grid-premium';
import prettyBytes from 'pretty-bytes';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import { styled } from '@mui/material/styles';
import { enqueueSnackbar } from 'notistack';

import HelpButton from '../HelpButton';
import store from '../../store';
import { downloadDirectly } from '../../utils';
import unlockDocument from '../../utils/unlockDocument';

const title = <DialogTitle>Documents Manager</DialogTitle>;

const FullGrid = styled(Grid)({
  height: '100%',
  width: '100%',
});

export default memo(function () {
  const documentsStore = useLocalObservable(() => store.documentsStore);
  const loadingStore = useLocalObservable(() => store.loadingStore);
  const windowsStore = useLocalObservable(() => store.windowsStore);

  const handleDownloadDocument = useCallback(downloadDirectly, []);
  const handleDeleteDocument = useCallback((name) => {
    documentsStore.delete(name);
  }, []);
  const handleDecryptDocument = useCallback(async (document) => {
    const loading = loadingStore.add(`Decrypting ${document.name}...`);
    try {
      const { blob, name } = document;
      const decryptedBlob = await unlockDocument(blob);
      documentsStore.modify(name, decryptedBlob);
      enqueueSnackbar('Document decrypted successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(error.message, { variant: 'error' });
    }
    loadingStore.remove(loading);
  }, []);

  const handleDocumentsChange = useCallback((documents) => {
    for (const document of documents) {
      documentsStore.add(document);
    }
  }, []);
  const handleCleanDocuments = useCallback(() => documentsStore.clean(), []);
  const handleToggleWindow = useCallback(() => windowsStore.toggle('documentsManager'), []);

  return (
    <Observer>
      {() => (
        <Dialog
          open={windowsStore.getDocumentsManager}
          onClose={handleToggleWindow}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              height: '70%',
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
            <HelpButton
              content="
              There are all your documents. If you download a document from DeepL, it will be added here automatically.
              You can also add your own documents.
              You can remove their editing restrictions and banners here. 
              Decryption currently only supports docx, doc, ppt, pptx, pdf.
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
          <DialogContent id='dc-documents-manager'>
            <FullGrid container>
              <FullGrid item md={4} sm={12} sx={(theme) => ({
                [theme.breakpoints.down('md')]: {
                  height: '20%',
                },
                [theme.breakpoints.up('md')]: {
                  paddingRight: '24px'
                }
              })}>
                <FileUploader handleDocumentsChange={handleDocumentsChange} />
              </FullGrid>
              <FullGrid item md={8} sm={12} sx={(theme) => ({
                [theme.breakpoints.down('md')]: {
                  height: '70%',
                },
              })}>
                <DataGridPremium
                  columns={[
                    { field: 'name', headerName: 'Name', minWidth: 250, flex: 1 },
                    { field: 'type', headerName: 'Type', minWidth: 250, flex: 1 },
                    {
                      field: 'actions',
                      type: 'actions',
                      headerName: 'Actions',
                      getActions: (params) => [
                        <GridActionsCellItem
                          label="Delete"
                          icon={<DeleteIcon />}
                          onClick={() => handleDeleteDocument(params.row.name)}
                        />,
                        <GridActionsCellItem
                          label="Decrypt"
                          icon={<LockOpenIcon />}
                          onClick={() => handleDecryptDocument(params.row)}
                        />,
                        <GridActionsCellItem
                          label={`Download (Size: ${prettyBytes(params.row.blob.size)})`}
                          icon={<DownloadIcon />}
                          onClick={() => handleDownloadDocument(params.row.blob, params.row.name)}
                        />,
                      ],
                      width: 150,
                    },
                  ]}
                  pinnedColumns={{ right: ['actions'] }}
                  rows={documentsStore.list.map((document) => ({
                    id: document.name,
                    name: document.name,
                    type: document.blob?.type,
                    blob: document.blob,
                  }))}
                />
              </FullGrid>
            </FullGrid>
          </DialogContent>
          <DialogActions>
            {documentsStore.list.length > 0 && (
              <Button onClick={handleCleanDocuments}>Clean All Documents</Button>
            )}
            <Button onClick={handleToggleWindow}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </Observer>
  );
}, () => true);
