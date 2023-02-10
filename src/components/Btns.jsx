import { memo, useState, useEffect } from 'react'
import { styled } from '@mui/material/styles';

import Fab from '@mui/material/Fab';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import { waitForSelector } from 'utils';
import Portal from '@mui/base/Portal';
import { injectAnalytic } from "analytic";

const Wrapper = styled(Stack)({
  float: 'right',
  '@media (max-width: 680px)': {
    float: 'initial',
    width: '100%',
    marginBottom: '24px'
  }
});

function Btns({ btns }) {

  const [container, setContainer] = useState(null);

  useEffect(() => {
    waitForSelector('#dl_translator')
      .then((el) => {
        injectAnalytic();
        const div = document.createElement('div');
        el.prepend(div);
        setContainer(div);
      });
  }, [])

  return (
    container ? <Portal container={container}>
      <Wrapper
        direction="row"
        divider={<Divider orientation="vertical" flexItem />}
        spacing={2}
        justifyContent="space-evenly"
      >
        {
          (btns ?? []).map((btn, key) => {

            if (!btn.show) return null

            return (
              <Tooltip
                key={btn.label ?? key}
                title={btn.label}
              >
                <Fab
                  onClick={btn.onClick}
                  color="primary"
                  aria-label={btn.label}
                  sx={{
                    animation: btn.bounce ? 'DeepL-Crack-Bounce-Animation 3s ease-in-out infinite' : 'none',
                  }}
                >
                  {btn.icon}
                </Fab>
              </Tooltip>

            )
          })
        }
      </Wrapper>
    </Portal> : null
  )
}

export default memo(Btns, (prevProps, nextProps) => prevProps.btns === nextProps.btns);