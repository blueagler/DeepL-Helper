import GlobalStyles from '@mui/material/GlobalStyles';

const gs = <GlobalStyles
  styles={{
    '#dl_cookieBanner, #lmt_pro_ad_container': {
      display: 'none'
    },
    '@keyframes DeepL-Crack-Bounce-Animation': {
      '0%': {
        transform: 'scale(1)'
      },
      '50%': {
        transform: 'scale(0.9)'
      },
      '100%': {
        transform: 'scale(1)'
      }
    }
  }}
/>

export default function () {
  return gs;
}