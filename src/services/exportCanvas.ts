import { toPng, toJpeg, toBlob } from 'html-to-image';

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
 * Uses 4-tier fallback:
 * 1. Direct CORS fetch with cache-busting parameter to prevent non-CORS disk cache hits
 * 2. HTMLImageElement + Canvas data URL conversion
 * 3. Fallback format (.jpg instead of .webp)
 * 4. High-reliability CORS proxy fallback
 */
async function getBase64ImageFromUrl(url: string): Promise<string> {
  if (!url || url.startsWith('data:')) return url;

  // Tier 1: Direct CORS fetch with cache-busting to bypass stale non-CORS disk cache
  try {
    const fetchUrl = url.includes('?') ? `${url}&cors_bypass=1` : `${url}?cors_bypass=1`;
    const response = await fetch(fetchUrl, { mode: 'cors', cache: 'reload' });
    if (response.ok) {
      const blob = await response.blob();
      const base64 = await blobToBase64(blob);
      if (base64.startsWith('data:image')) return base64;
    }
  } catch {
    // Continue to next tier
  }

  // Tier 2: HTMLImageElement Canvas Conversion
  try {
    const base64 = await loadImageElementAsBase64(url, true);
    if (base64 && base64.startsWith('data:image')) return base64;
  } catch {
    // Continue to next tier
  }

  // Tier 3: Format Fallback (.webp -> .jpg)
  if (url.endsWith('.webp')) {
    try {
      const jpgUrl = url.replace(/\.webp$/, '.jpg');
      const fetchUrl = jpgUrl.includes('?') ? `${jpgUrl}&cors_bypass=1` : `${jpgUrl}?cors_bypass=1`;
      const response = await fetch(fetchUrl, { mode: 'cors', cache: 'reload' });
      if (response.ok) {
        const blob = await response.blob();
        const base64 = await blobToBase64(blob);
        if (base64.startsWith('data:image')) return base64;
      }
    } catch {
      // Continue to next tier
    }
  }

  // Tier 4: Public CORS Proxy Fallback for strict CDN policies
  try {
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
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
 * and waiting for full decoding (critical for Edge/Chromium canvas rendering).
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
          // Ensure image decoding is complete in Edge/Chromium engine
          if ('decode' in img && typeof img.decode === 'function') {
            await img.decode().catch(() => {});
          }
        }
      }
    })
  );

  // Return restore function
  return () => {
    originalSrcs.forEach(({ img, src }) => {
      img.src = src;
    });
  };
}

/**
 * Common configuration options for html-to-image
 */
const getExportOptions = (skipFonts = false) => ({
  quality: 0.95,
  pixelRatio: 2, // 2x high-resolution export
  cacheBust: false,
  skipFonts,
  filter: (node: HTMLElement) => {
    if (node.classList && node.classList.contains('no-export')) {
      return false;
    }
    return true;
  },
});

/**
 * Captures the target grid element and downloads it as high-res PNG or JPEG
 * Compatible with Microsoft Edge, Chrome, Safari, and Firefox.
 */
export async function downloadGridImage(
  element: HTMLElement,
  format: 'png' | 'jpeg' = 'png',
  fileName: string = 'my-9-pokemon-cards.png'
): Promise<void> {
  const restoreImages = await inlineElementImages(element);

  try {
    let dataUrl: string;
    const primaryOptions = getExportOptions(false);

    try {
      // Warmup pass for Edge/Chromium SVG element asset caching
      if (format === 'jpeg') {
        await toJpeg(element, { ...primaryOptions, backgroundColor: '#ffffff' });
        dataUrl = await toJpeg(element, { ...primaryOptions, backgroundColor: '#ffffff' });
      } else {
        await toPng(element, primaryOptions);
        dataUrl = await toPng(element, primaryOptions);
      }
    } catch (primaryErr) {
      console.warn('Primary export pass failed, retrying with fallback options:', primaryErr);
      // Fallback pass skipping external font embed if font fetch blocked
      const fallbackOptions = getExportOptions(true);
      if (format === 'jpeg') {
        dataUrl = await toJpeg(element, { ...fallbackOptions, backgroundColor: '#ffffff' });
      } else {
        dataUrl = await toPng(element, fallbackOptions);
      }
    }

    // Trigger download using DOM-attached link (required for Edge / Firefox)
    const link = document.createElement('a');
    link.download = fileName;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Failed to export grid image:', error);
    throw error;
  } finally {
    restoreImages();
  }
}

/**
 * Copies the grid image directly to user's system clipboard (Edge/Chrome/Safari supported)
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
