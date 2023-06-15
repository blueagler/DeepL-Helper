import GlobalStyles from '@mui/material/GlobalStyles';

export default function () {
  return <GlobalStyles
    styles={{
      '#dl_cookieBanner, #lmt_pro_ad_container': {
        display: 'none'
      },
      '@keyframes DeepL-Crack-Bounce-Animation': {
        '0%': {
          transform: 'scale(1.05)'
        },
        '50%': {
          transform: 'scale(1)'
        },
        '100%': {
          transform: 'scale(1.05)'
        }
      },
      '@media (max-width: 840px)': {
        'button[role="tab"] > div': {
          width: "calc(50vw - 25px)"
        }
      },
      '.dc-guide-mask': {
        zIndex: 1301
      },
      '.dc-guide-modal': {
        zIndex: 1302
      }
    }}
  />;
}