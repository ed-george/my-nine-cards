import { toPng, toJpeg, toBlob } from 'html-to-image';

/**
 * Converts an image URL to a base64 data URL to prevent CORS canvas export failures across browsers
 */
async function getBase64ImageFromUrl(url: string): Promise<string> {
  if (!url || url.startsWith('data:')) return url;

  try {
    const response = await fetch(url, { mode: 'cors' });
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn('Failed to convert image to base64 via fetch:', url, err);
    return url;
  }
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
