// A photo avatar from the phone's camera or gallery (I-031, the owner): the picked image is drawn
// to a canvas, centre-cropped square and downscaled to 128 × 128, and exported as a JPEG data
// URL under the contract's cap (re-encoding also strips EXIF; the bitmap honours the
// orientation tag). Nothing leaves the phone but the small JPEG.
import { PHOTO_MAX_BYTES } from '@partybox/shared';

export const PHOTO_SIZE = 128;

async function decode(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if ('createImageBitmap' in window) {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch {
      /* an old Safari: fall through to an <img> */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('image failed to decode'));
      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** The JPEG data URL for `file`, or null when the image cannot be read. */
export async function photoFromFile(file: File): Promise<string | null> {
  try {
    const image = await decode(file);
    const w = image.width;
    const h = image.height;
    if (!w || !h) return null;
    const side = Math.min(w, h);
    const canvas = document.createElement('canvas');
    canvas.width = PHOTO_SIZE;
    canvas.height = PHOTO_SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(image, (w - side) / 2, (h - side) / 2, side, side, 0, 0, PHOTO_SIZE, PHOTO_SIZE);
    if ('close' in image) image.close();
    // ~6–12 KB at 0.8; a busy picture that lands over the cap tries a lower quality.
    for (const quality of [0.8, 0.6, 0.4]) {
      const url = canvas.toDataURL('image/jpeg', quality);
      if (url.length <= PHOTO_MAX_BYTES) return url;
    }
    return null;
  } catch {
    return null;
  }
}
