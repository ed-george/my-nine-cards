import { toPng, toJpeg, toBlob } from 'html-to-image';
import { DEFAULT_API_HEADERS } from './tcgdexApi';

/**
 * Detects if the current device is running iOS (iPhone, iPad, iPod)
 */
export function isIOS(): boolean {
  if (typeof window === 'undefined' || !navigator) return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

/**
 * Detects if the current device is a mobile device (iPhone, iPad, Android phone/tablet)
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined' || !navigator) return false;
  const ua = navigator.userAgent || '';
  const isTouchMac = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) || isTouchMac;
}

/**
 * Checks if the browser supports Web Share API with image file sharing (iOS 15+ Safari, Android Chrome)
 */
export function canShareImages(): boolean {
  if (typeof window === 'undefined' || !navigator || !navigator.share || !navigator.canShare) {
    return false;
  }
  try {
    const testFile = new File(['test'], 'test.png', { type: 'image/png' });
    return navigator.canShare({ files: [testFile] });
  } catch {
    return false;
  }
}

/**
 * Converts a Base64 Data URL to a Blob
 */
export function dataUrlToBlob(dataUrl: string, mimeType = 'image/png'): Blob {
  const arr = dataUrl.split(',');
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mimeType });
}

/**
 * Converts a Blob to a Base64 data URL
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Loads an image into an HTMLImageElement and converts it to Base64 via Canvas
 */
function loadImageElementAsBase64(url: string, useCrossOrigin = true): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (useCrossOrigin) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width || 300;
        canvas.height = img.naturalHeight || img.height || 420;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('No 2d canvas context available'));
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = (e) => reject(e);
    img.src = url;
  });
}

/**
 * Converts an image URL to a base64 data URL to prevent CORS canvas export failures across browsers.
 */
async function getBase64ImageFromUrl(url: string): Promise<string> {
  if (!url || url.startsWith('data:')) return url;

  // Tier 1: Direct CORS fetch with cache-busting
  try {
    const fetchUrl = url.includes('?') ? `${url}&cors_bypass=1` : `${url}?cors_bypass=1`;
    const response = await fetch(fetchUrl, { mode: 'cors', cache: 'reload', headers: DEFAULT_API_HEADERS });
    if (response.ok) {
      const blob = await response.blob();
      const base64 = await blobToBase64(blob);
      if (base64.startsWith('data:image')) return base64;
    }
  } catch {
    // Continue
  }

  // Tier 2: HTMLImageElement Canvas Conversion
  try {
    const base64 = await loadImageElementAsBase64(url, true);
    if (base64 && base64.startsWith('data:image')) return base64;
  } catch {
    // Continue
  }

  // Tier 3: Format Fallback (.webp -> .jpg)
  if (url.endsWith('.webp')) {
    try {
      const jpgUrl = url.replace(/\.webp$/, '.jpg');
      const fetchUrl = jpgUrl.includes('?') ? `${jpgUrl}&cors_bypass=1` : `${jpgUrl}?cors_bypass=1`;
      const response = await fetch(fetchUrl, { mode: 'cors', cache: 'reload', headers: DEFAULT_API_HEADERS });
      if (response.ok) {
        const blob = await response.blob();
        const base64 = await blobToBase64(blob);
        if (base64.startsWith('data:image')) return base64;
      }
    } catch {
      // Continue
    }
  }

  // Tier 4: Public CORS Proxy Fallback
  try {
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl, { headers: DEFAULT_API_HEADERS });
    if (response.ok) {
      const blob = await response.blob();
      const base64 = await blobToBase64(blob);
      if (base64.startsWith('data:image')) return base64;
    }
  } catch (err) {
    console.warn('All CORS base64 conversion tiers failed for image:', url, err);
  }

  return url;
}

/**
 * Pre-processes all img tags in element, converting src URLs to inline Base64 data URLs
 */
async function inlineElementImages(element: HTMLElement): Promise<() => void> {
  const imgElements = Array.from(element.querySelectorAll('img'));
  const originalSrcs: { img: HTMLImageElement; src: string }[] = [];

  await Promise.all(
    imgElements.map(async (img) => {
      if (img.src && !img.src.startsWith('data:')) {
        originalSrcs.push({ img, src: img.src });
        const base64 = await getBase64ImageFromUrl(img.src);
        if (base64.startsWith('data:')) {
          img.src = base64;
          if ('decode' in img && typeof img.decode === 'function') {
            await img.decode().catch(() => {});
          }
        }
      }
    })
  );

  return () => {
    originalSrcs.forEach(({ img, src }) => {
      img.src = src;
    });
  };
}

const getExportOptions = (skipFonts = false) => ({
  quality: 0.95,
  pixelRatio: 2,
  cacheBust: false,
  skipFonts,
  filter: (node: HTMLElement) => {
    if (node.classList && node.classList.contains('no-export')) {
      return false;
    }
    return true;
  },
});

export interface ExportResult {
  dataUrl: string;
  blob: Blob;
  shared: boolean;
}

/**
 * Captures the target grid element and handles downloads / native iOS sharing
 */
export async function downloadGridImage(
  element: HTMLElement,
  format: 'png' | 'jpeg' = 'png',
  fileName: string = 'my-9-cards.png'
): Promise<ExportResult> {
  const restoreImages = await inlineElementImages(element);

  try {
    let dataUrl: string;
    const primaryOptions = getExportOptions(false);

    try {
      if (format === 'jpeg') {
        await toJpeg(element, { ...primaryOptions, backgroundColor: '#ffffff' });
        dataUrl = await toJpeg(element, { ...primaryOptions, backgroundColor: '#ffffff' });
      } else {
        await toPng(element, primaryOptions);
        dataUrl = await toPng(element, primaryOptions);
      }
    } catch (primaryErr) {
      console.warn('Primary export pass failed, retrying with fallback options:', primaryErr);
      const fallbackOptions = getExportOptions(true);
      if (format === 'jpeg') {
        dataUrl = await toJpeg(element, { ...fallbackOptions, backgroundColor: '#ffffff' });
      } else {
        dataUrl = await toPng(element, fallbackOptions);
      }
    }

    const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const blob = dataUrlToBlob(dataUrl, mimeType);
    let shared = false;

    // Web Share API (iOS 15+ Safari / Mobile Native Share Sheet)
    if (isMobileDevice() && canShareImages()) {
      try {
        const file = new File([blob], fileName, { type: mimeType });
        await navigator.share({
          files: [file],
          title: 'My 9 Cards Showcase',
        });
        shared = true;
      } catch (shareErr) {
        console.warn('Native share sheet dismissed or not completed:', shareErr);
      }
    }

    // Standard download link (using Blob URL for mobile/desktop browser compatibility)
    if (!shared) {
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = fileName;
      link.href = blobUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
    }

    return { dataUrl, blob, shared };
  } catch (error) {
    console.error('Failed to export grid image:', error);
    throw error;
  } finally {
    restoreImages();
  }
}

/**
 * Copies the grid image directly to user's system clipboard
 */
export async function copyGridImageToClipboard(element: HTMLElement): Promise<boolean> {
  const restoreImages = await inlineElementImages(element);

  try {
    let blob: Blob | null = null;
    const primaryOptions = getExportOptions(false);

    try {
      await toBlob(element, primaryOptions);
      blob = await toBlob(element, primaryOptions);
    } catch {
      blob = await toBlob(element, getExportOptions(true));
    }

    if (!blob) throw new Error('Failed to generate image blob');

    if (navigator.clipboard && typeof navigator.clipboard.write === 'function') {
      try {
        const item = new ClipboardItem({ [blob.type || 'image/png']: blob });
        await navigator.clipboard.write([item]);
        return true;
      } catch (clipboardErr) {
        console.warn('ClipboardItem direct write failed, trying promise-wrapped item:', clipboardErr);
        const item = new ClipboardItem({
          'image/png': Promise.resolve(blob),
        });
        await navigator.clipboard.write([item]);
        return true;
      }
    } else {
      throw new Error('Clipboard API not supported in this browser environment');
    }
  } catch (err) {
    console.error('Clipboard copy failed:', err);
    return false;
  } finally {
    restoreImages();
  }
}
