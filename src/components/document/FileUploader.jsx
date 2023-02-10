import { useCallback, memo, useState, useEffect, useRef } from 'react'
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

function FileUploader({ handleDocumentChange }) {

  const [dragAnimation, setDragAnimation] = useState(false);

  const handleDragEnter = useCallback((event) => {
    event.preventDefault()
    setDragAnimation(true)
  }, [])

  const handleDragOver = useCallback((event) => {
    event.stopPropagation()
    event.preventDefault()
    setDragAnimation(true)
  }, [])

  const handleDrop = useCallback((event) => {
    event.stopPropagation()
    event.preventDefault()
    if (event.dataTransfer.files) {
      handleDocumentChange(event.dataTransfer.files)
    }
    setDragAnimation(false)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragAnimation(false)
  }, [])

  const dragRef = useRef()
  const inputRef = useRef()

  useEffect(() => {
    if (dragRef.current) {
      dragRef.current.ondragenter = handleDragEnter
      dragRef.current.ondragover = handleDragOver
      dragRef.current.ondrop = handleDrop
      dragRef.current.ondragleave = handleDragLeave
    }
  }, [dragRef.current])

  const handleClick = useCallback(() => {
    inputRef.current.click()
  }, [inputRef.current])

  const handleInputChange = useCallback((event) => {
    handleDocumentChange(event.target.files)
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
          width: '100%',
          animation: dragAnimation ? 'DeepL-Crack-Bounce-Animation 1s ease-in-out infinite' : 'none',
        }}
        ref={dragRef}
        onClick={handleClick}
      >
        {uploadUI}
      </Button>
    </>
  )
}

export default memo(FileUploader, () => true);