import { useCallback, memo, useState, useRef } from 'react'
import Popover from '@mui/material/Popover';
import IconButton from '@mui/material/IconButton';
import HelpIcon from '@mui/icons-material/Help';
import Typography from '@mui/material/Typography';

export default memo(function ({ icon, content, anchorOrigin, transformOrigin }) {
  const [helpPopover, setHelpPopover] = useState(false);
  const buttonRef = useRef(null);
  const handleOpen = useCallback(() => setHelpPopover(true), []);
  const handleClose = useCallback(() => setHelpPopover(false), []);
  return (
    <>
      <IconButton
        size="large"
        onMouseEnter={handleOpen}
        onMouseLeave={handleClose}
        ref={buttonRef}
      >
        {icon || <HelpIcon />}
      </IconButton>
      <Popover
        sx={{ pointerEvents: 'none' }}
        anchorOrigin={anchorOrigin}
        transformOrigin={transformOrigin}
        open={helpPopover}
        anchorEl={buttonRef.current}
        onClose={handleClose}
        disableRestoreFocus
      >
        <Typography sx={{
          p: 1,
          maxWidth: '400px',
        }}>
          {content}
        </Typography>
      </Popover>
    </>
  )
}, (prevProps, nextProps) => {
  return prevProps.content === nextProps.content && prevProps.anchorOrigin === nextProps.anchorOrigin && prevProps.transformOrigin === nextProps.transformOrigin;
});
