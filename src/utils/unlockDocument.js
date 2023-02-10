import JSZip from 'jszip';
import mupdf from './pdfUnlock';

async function parseXMLFromZip(zip, path) {
  return new DOMParser().parseFromString(await zip.file(path).async('string'), 'application/xml');
}

function saveXMLToZip(zip, path, xml) {
  return zip.file(path, new XMLSerializer().serializeToString(xml));
}

const typeHandlers = [
  {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    handler: async function (blob) {
      const zip = await JSZip.loadAsync(blob);
      const document = await parseXMLFromZip(zip, 'word/document.xml'),
        settings = await parseXMLFromZip(zip, 'word/settings.xml');

      if (settings.getElementsByTagName('w:documentProtection').length === 0) {
        throw new Error('Document is not protected');
      }

      for (const tag of settings.getElementsByTagName('w:documentProtection')) {
        tag.remove();
      }

      for (const p of document.getElementsByTagName('w:p')) {
        if (p.querySelector('*[id="DeepLBoxSPIDType"]')) {
          p.remove();
        }
      }

      saveXMLToZip(zip, 'word/document.xml', document);
      saveXMLToZip(zip, 'word/settings.xml', settings);
      return await zip.generateAsync({
        type: 'blob',
        mimeType: blob.type,
        compression: "DEFLATE"
      });
    }
  },
  {
    type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    handler: async function (blob) {
      const zip = await JSZip.loadAsync(blob);
      const presentation = await parseXMLFromZip(zip, 'ppt/presentation.xml');
      for (const tag of presentation.getElementsByTagName('p:modifyVerifier')) {
        tag.remove();
      }
      saveXMLToZip(zip, 'ppt/presentation.xml', presentation);
      let deletedDeepL = false;
      zip.folder('ppt/slides/_rels').forEach(async function (_, file) {
        if (deletedDeepL) {
          return;
        }
        const slide_rels = new DOMParser().parseFromString((await file.async('string')).replaceAll('﻿', ''), 'application/xml');
        if (slide_rels.querySelector('[Target="https://www.deepl.com/pro?cta=edit-document"]')) {
          for (const r of [...slide_rels.getElementsByTagName('Relationship')].filter(r => r.getAttribute('Target') !== 'https://www.deepl.com/pro?cta=edit-document')) {
            const path = r.getAttribute('Target').slice(1);
            zip.remove(path);
            if (path.includes('slideLayouts')) {
              zip.remove(path.replace('slideLayouts/', 'slideLayouts/_rels/').replace('.xml', '.xml.rels'));
            }
          }
          zip.remove(file.name);
          zip.remove(file.name.replace('_rels/', '').replace('.rels', ''));
          deletedDeepL = true;
        }
      })
      return await zip.generateAsync({
        type: 'blob',
        mimeType: blob.type,
        compression: "DEFLATE"
      });
    }
  },
  {
    type: 'application/pdf',
    handler: async function (blob) {
      return new Blob([await mupdf.unlock(new Uint8Array(await blob.arrayBuffer()))], { type: blob.type });
    }
  }
]

export default async function (blob) {
  const handler = typeHandlers.find(h => h.type === blob.type)?.handler;
  if (handler) {
    return await handler(blob);
  } else {
    throw new Error(`Unsupported document type: ${blob.type}`);
  }
}