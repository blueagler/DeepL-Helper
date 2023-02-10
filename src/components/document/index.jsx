import { useCallback, memo, useState } from 'react'
import { useLocalObservable, Observer } from 'mobx-react';
import store from 'store';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import FileUploader from "./FileUploader";
import List from "./List";
import { styled } from '@mui/material/styles';
import Popover from '@mui/material/Popover';
import IconButton from '@mui/material/IconButton';
import HelpIcon from '@mui/icons-material/Help';
import Typography from '@mui/material/Typography';
import { downloadDirectly } from 'utils';
import unlockDocument from 'utils/unlockDocument';
import { enqueueSnackbar } from 'notistack';


const title = <DialogTitle>Document Manager</DialogTitle>;

const FullGrid = styled(Grid)({
  height: '100%',
  width: '100%'
});

function Document() {

  const documentStore = useLocalObservable(() => store.documentStore);
  const windowStore = useLocalObservable(() => store.windowStore);

  const loadingStore = useLocalObservable(() => store.loadingStore);

  const handleDownloadDocument = useCallback(downloadDirectly, []);

  const handleDeleteDocument = useCallback((name) => {
    documentStore.deleteDocument(name);
  }, []);

  const handleDecryptDocument = useCallback((document) => {
    (async function () {
      const loading = loadingStore.addLoading(`Decrypting ${document.name}...`);
      try {
        const { blob, name } = document;
        const decryptedBlob = await unlockDocument(blob);
        documentStore.modifyDocument(name, decryptedBlob);
        enqueueSnackbar('Document decrypted successfully', { variant: 'success' });
      } catch (error) {
        enqueueSnackbar(error.message, { variant: 'error' });
      }
      loadingStore.removeLoading(loading);
    })();
  }, []);

  const handleDocumentChange = useCallback((documents) => {
    for (const document of documents) {
      documentStore.addDocument(document)
    }
  }, []);

  const handleCleanDocument = useCallback(() => documentStore.cleanDocument(), []);

  const handleToggleDocument = useCallback(() => windowStore.toggleDocumentWindow(), []);

  const [helpPopover, setHelpPopover] = useState(null);

  const handleHelpPopoverOpen = useCallback((event) => {
    setHelpPopover(event.currentTarget);
  }, []);

  const handleHelpPopoverClose = useCallback(() => {
    setHelpPopover(null);
  }, []);

  return (
    <Observer>{() =>
      <Dialog
        open={windowStore.isDocumentWindowOpen ?? false}
        onClose={handleToggleDocument}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            height: '70%',
          }
        }}
      >
        <IconButton
          size="large"
          sx={{
            position: 'absolute',
            top: 10,
            right: 10
          }}
          onMouseEnter={handleHelpPopoverOpen}
          onMouseLeave={handleHelpPopoverClose}
        >
          <HelpIcon />
        </IconButton>
        <Popover
          sx={{
            pointerEvents: 'none',
          }}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(helpPopover)}
          anchorEl={helpPopover}
          onClose={handleHelpPopoverClose}
          disableRestoreFocus
        >
          <Typography sx={{ p: 1 }}>
            Currently, we support Pdf, Doc, Docx, PowerPoint, PowerPointx. The process of decryption is done on the client side.
          </Typography>
        </Popover>
        {title}
        <DialogContent>
          <FullGrid container>
            <FullGrid item md={5} sm={12} sx={(theme) => ({
              [theme.breakpoints.down('md')]: {
                height: '20%'
              }
            })}>
              <FileUploader handleDocumentChange={handleDocumentChange} />
            </FullGrid>
            <FullGrid item md={7} sm={12} sx={(theme) => ({
              [theme.breakpoints.down('md')]: {
                height: '70%'
              },
            })}>
              <List
                list={documentStore.getDocumentList}
                handleDownloadDocument={handleDownloadDocument}
                handleDeleteDocument={handleDeleteDocument}
                handleDecryptDocument={handleDecryptDocument} />
            </FullGrid>
          </FullGrid>
        </DialogContent>
        <DialogActions>
          {
            documentStore.getDocumentList.length > 0 &&
            <Button onClick={handleCleanDocument}>
              Clean Decrypted Documents
            </Button>
          }
          <Button onClick={handleToggleDocument}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    }</Observer>
  )
}

export default memo(Document, () => true);