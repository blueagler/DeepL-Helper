import { proxy } from "./proxy";
import { createRoot } from 'react-dom/client';
import App from './App'
import checkGFW from './utils/checkGFW';

proxy();


(async () => {
  if (!localStorage.getItem('dc-api-server')) {
    if (await checkGFW()) {
      localStorage.setItem('dc-api-server', 'https://v1-hk-api.blueagle.top')
    } else {
      localStorage.setItem('dc-api-server', 'https://v1-cf-api.blueagle.top')
    }
  }
  if (/(translator|write)/.test(window.location.pathname)) {
    const rootContainer = document.createElement('div')
    const root = createRoot(rootContainer);
    if (document.body) {
      root.render(<App />);
      document.body.prepend(rootContainer)
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        root.render(<App />);
        document.body.prepend(rootContainer)
      })
    }
  }
})();