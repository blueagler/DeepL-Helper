import { useCallback, memo, useEffect, useRef } from 'react'
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const uploadUI = <Grid
  container
  direction="column"
  justifyContent="center"
  alignItems="center"
  sx={{
    height: '100%',
  }}
>
  <Grid item>
    <CloudUploadIcon sx={{ fontSize: 80 }} />
  </Grid>
  <Grid item sx={{ fontSize: 24 }}>
    Drag or Click to upload
  </Grid>
</Grid>;

export default memo(function ({ handleDocumentsChange }) {

  const handleDragEvent = useCallback((event) => {
    event.preventDefault()
    event.stopPropagation()
  }, [])

  const handleDrop = useCallback((event) => {
    event.preventDefault()
    event.stopPropagation()
    if (event.dataTransfer.files) {
      handleDocumentsChange(event.dataTransfer.files)
    }
  }, [])

  const dragRef = useRef()
  const inputRef = useRef()

  useEffect(() => {
    if (dragRef.current) {
      dragRef.current.ondragenter = handleDragEvent
      dragRef.current.ondragover = handleDragEvent
      dragRef.current.ondrop = handleDrop
      dragRef.current.ondragleave = handleDragEvent
    }
  }, [dragRef.current])

  const handleClick = useCallback(() => {
    inputRef.current.click()
  }, [inputRef.current])

  const handleInputChange = useCallback((event) => {
    handleDocumentsChange(event.target.files)
  }, [])

  return (
    <>
      <input
        type='file'
        ref={inputRef}
        onChange={handleInputChange}
        multiple={true}
        style={{ display: 'none' }}
      />
      <Button
        variant="outlined"
        sx={{
          height: '100%',
          width: '100%'
        }}
        ref={dragRef}
        onClick={handleClick}
      >
        {uploadUI}
      </Button>
    </>
  )
}, () => true);
