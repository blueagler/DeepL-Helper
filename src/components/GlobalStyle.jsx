import GlobalStyles from '@mui/material/GlobalStyles';

const gs = <GlobalStyles
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
    }
  }}
/>

export default function () {
  return gs;
}