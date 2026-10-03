import { toPng, toJpeg, toBlob } from 'html-to-image';

/**
 * Converts an image URL to a base64 data URL to prevent CORS canvas export failures
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
 * Captures the target grid element and downloads it as high-res PNG or JPEG
 */
export async function downloadGridImage(
  element: HTMLElement,
  format: 'png' | 'jpeg' = 'png',
  fileName: string = 'my-9-pokemon-cards.png'
): Promise<void> {
  // Inline external image URLs to base64 before capturing
  const restoreImages = await inlineElementImages(element);

  const options = {
    quality: 0.95,
    pixelRatio: 2, // 2x resolution
    cacheBust: false,
    filter: (node: HTMLElement) => {
      if (node.classList && node.classList.contains('no-export')) {
        return false;
      }
      return true;
    },
  };

  try {
    let dataUrl: string;
    if (format === 'jpeg') {
      dataUrl = await toJpeg(element, { ...options, backgroundColor: '#ffffff' });
    } else {
      dataUrl = await toPng(element, options);
    }

    const link = document.createElement('a');
    link.download = fileName;
    link.href = dataUrl;
    link.click();
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
    const blob = await toBlob(element, {
      quality: 0.95,
      pixelRatio: 2,
      cacheBust: false,
      filter: (node: HTMLElement) => {
        if (node.classList && node.classList.contains('no-export')) {
          return false;
        }
        return true;
      },
    });

    if (!blob) throw new Error('Failed to generate image blob');

    if (navigator.clipboard && navigator.clipboard.write) {
      const item = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([item]);
      return true;
    } else {
      throw new Error('Clipboard API not supported in this browser');
    }
  } catch (err) {
    console.error('Clipboard copy failed:', err);
    return false;
  } finally {
    restoreImages();
  }
}
