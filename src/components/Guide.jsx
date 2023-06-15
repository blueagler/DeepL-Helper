import Guide from "byte-guide";
import { memo } from "react";
import Typography from "@mui/material/Typography";
import store from "../store";

const steps = [
  {
    selector: "#dc-banners",
    title: "Wellcome to DeepL Crack",
    content: (
      <div>
        <Typography variant="body1" gutterBottom>
          I'm a Chromium extension that helps you to bypass the DeepL Pro subscription.
        </Typography>
        <Typography variant="h6" gutterBottom>
          <b>I'm FREE. If you bought it from others, you should ask for refunds</b>
        </Typography>
        <Typography variant="body1" gutterBottom>
          <b>I'm not a hack, but just a bypass. You should use me for testing purposes only and delete me after 24 hours.</b>
        </Typography>
      </div>
    ),
    placement: "bottom-left"
  },
  {
    selector: "#dc-banners",
    title: "Instructions",
    content: (
      <div>
        <Typography variant="h6" gutterBottom>
          <b>Read <a href="https://github.com/blueagler/DeepL-Crack" target="_blank" style={{
            textDecoration: "underline",
            color: "red"
          }}>Github Readme</a> carefully.</b>
        </Typography>
        <Typography variant="body1" gutterBottom>
          <b>Features:</b>
        </Typography>
        <ul>
          <li>Bypass the free translator's limit of 5,000 characters</li>
          <li>Remove edit restriction (available for docx, doc, ppt, pptx, pdf)</li>
          <li>Remove DeepL Pro Banner for docx, doc, ppt, pptx files</li>
          <li>Use DeepL Pro Account Cookies/DeepL Api Free Token to translate (This can help you bypass frequency limitations of web api)</li>
          <li>Unlock Formal/informal tone</li>
          <li>Clean cookie and randomnize User Agent</li>
        </ul>
        <Typography variant="body1" gutterBottom>
          <b>Limitations:</b>
        </Typography>
        <ul>
          <li>DeepL may ban your IP due to high frequency of requests to web api. There are 2 solutions:</li>
          <ul>
            <li>Use DeepL Pro Account Cookies/DeepL Api Free Token to translate.</li>
            <li>First, Use a proxy to change IP. Then, click clean cookie button.</li>
          </ul>
          <li>File translation quota and maximum upload size of 5 MB are not cracked due to server verification.</li>
          <li>Edge users should disable Advanced Security for deepl.com so that this extension can unlock PDF.</li>
        </ul>
      </div>
    ),
    placement: "bottom-left"
  },
  {
    selector: "#dc-banners",
    title: "Banner",
    content: (
      <Typography variant="body1" gutterBottom>
        Common features of this extension are listed here. Click those buttons to use.
      </Typography>
    ),
    placement: "bottom-left",
    beforeStepChange: () => {
      store.windowsStore.toggle("announcements")
    }
  },
  {
    selector: "#dc-announcements",
    title: "Announcements",
    content: (
      <div>
        <Typography variant="body1" gutterBottom>
          I will post announcements here. Please check it regularly. You can also see some guides here.
        </Typography>
      </div>
    ),
    placement: "right",
    beforeStepChange: () => {
      store.windowsStore.toggle("announcements")
      store.windowsStore.toggle("tokensAndCredentialsManager")
    },
    offset: {
      x: -340,
    }
  },
  {
    selector: "#dc-tokens-and-credentials-manager",
    title: "Tokens and Credentials Manager",
    content: (
      <div>
        <Typography variant="body1" gutterBottom>
          You can use DeepL Pro Credential/DeepL Api Free Token to translate.
          This can help you bypass frequency limitations of web api.
          Some free public resources may be provided. You can also add your own tokens/credentials.
        </Typography>
        <Typography variant="h6" gutterBottom>
          If you sponsor me, I may provide you some private tokens/credentials for you.
          Rememer to DM me on Telegram(@Blueagler) or Email(austinliu@blueagle.top) and remain your email address and UUID when you sponsor me.
        </Typography>
      </div>
    ),
    placement: "right",
    beforeStepChange: () => {
      store.windowsStore.toggle("tokensAndCredentialsManager")
      store.windowsStore.toggle("documentsManager")
    },
    offset: {
      x: -320,
    }
  },
  {
    selector: "#dc-documents-manager",
    title: "Documents Manager",
    content: (
      <div>
        <Typography variant="body1" gutterBottom>
          There are all your documents. If you download a document from DeepL, it will be added here automatically.
          You can also add your own documents.
        </Typography>
        <Typography variant="h6" gutterBottom>
          <b>You can remove their editing restrictions and banners here. Decryption currently only supports docx, doc, ppt, pptx, pdf.</b>
        </Typography>
      </div>
    ),
    placement: "right",
    beforeStepChange: () => {
      store.windowsStore.toggle("documentsManager")
    },
    offset: {
      x: -320,
    }
  },
  {
    selector: "#dc-clean-cookies",
    title: "Clean Cookies",
    content: (
      <div>
        <Typography variant="body1" gutterBottom>
          Although I will clean cookies automatically, you can also click this button to clean cookies manually.
          In case of reaching the frequency limit, you can try to change IP, then click this button to bypass the limit.
          If you cannot change IP, you can try to use DeepL Pro Credentials/DeepL Api Free Token in Tokens and Credentials Manager or wait for a while.
        </Typography>
      </div>
    ),
    placement: "bottom-right",
  },
  {
    selector: "#dc-dark-mode",
    title: "Dark Mode",
    content: (
      <div>
        <Typography variant="body1" gutterBottom>
          You can switch between dark mode and light mode here.
        </Typography>
      </div>
    ),
    placement: "bottom-right",
    beforeStepChange: () => {
      document.querySelector('.lmt__docTrans-tab-container').querySelectorAll('button')[0].click()
    }
  },
  {
    selector: "#panelTranslateText",
    title: "Translate Text",
    content: (
      <div>
        <Typography variant="body1" gutterBottom>
          You can translate text here. Normally, you may encounter the frequency limit, as I said before.
          However, even if you do not use DeepL Pro Credentials/DeepL Api Free Token or change IP, you only need to wait for a shorter time compared to users without this extension.
          Maybe 1 minute or less.
          Because I ramdomnize User Agent and identifer cookies for each request, so that DeepL can only identify you by IP.
        </Typography>
      </div>
    ),
    placement: "right",
    offset: {
      x: -520,
    },
    beforeStepChange: () => {
      document.querySelector('.lmt__docTrans-tab-container').querySelectorAll('button')[1].click()
    }
  },
  {
    selector: "#panelTranslateFiles",
    title: "Translate Documents",
    content: (
      <div>
        <Typography variant="body1" gutterBottom>
          You can translate documents here.
          Remember that when you download a document, it will be added to Documents Manager automatically where you can remove their editing restrictions and banners.
          As I said before, this extension cannot bypass file size limit.
          So, if you want to translate a large file, you can split it into several small files.
          If you encounter the frequency limit, you can try to change IP, then click Clean Cookies button to bypass the limit.
        </Typography>
      </div>
    ),
    offset: {
      x: -520,
    },
    placement: "right"
  },
  {
    selector: "#dc-sponsor",
    title: "Sponsor",
    content: (
      <div>
        <Typography variant="body1" gutterBottom>
          If you like this extension, you can sponsor me.
          I may provide you some private tokens/credentials for you.
        </Typography>
        <Typography variant="h6" gutterBottom>
          Rememer to DM me on Telegram(@Blueagler) or Email(austinliu@blueagle.top) and remain your email address and UUID. You can sponsor me via Buy Me A Coffee, Wechat Pay and Alipay.
        </Typography>
      </div>
    ),
    placement: "left-bottom"
  },
];

export default memo(function () {
  return (
    <Guide
      steps={steps}
      localKey="dc-guide"
      hotspot
      stepText={(stepIndex, stepCount) => `Step ${stepIndex} of ${stepCount}`}
      nextText="Next"
      okText="Finish"
      maskClassName="dc-guide-mask"
      modalClassName="dc-guide-modal"
      onClose={() => {
        document.documentElement.style.overflow = 'auto'
      }}
      visible={/translator/.test(window.location.href)}
    />
  );
}, () => true)