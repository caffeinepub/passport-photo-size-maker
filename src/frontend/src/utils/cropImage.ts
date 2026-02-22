interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

export async function cropImageManual(imageSrc: string, cropArea: CropArea): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Set canvas size to passport photo dimensions at 300 DPI
  // 3.5 cm × 4.5 cm at 300 DPI = 413 × 531 pixels
  const targetWidth = 413;
  const targetHeight = 531;

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  // Ensure crop area is within image bounds
  const x = Math.max(0, Math.min(cropArea.x, image.width - cropArea.width));
  const y = Math.max(0, Math.min(cropArea.y, image.height - cropArea.height));
  const width = Math.min(cropArea.width, image.width - x);
  const height = Math.min(cropArea.height, image.height - y);

  // Draw the cropped image scaled to the target dimensions
  ctx.drawImage(
    image,
    x,
    y,
    width,
    height,
    0,
    0,
    targetWidth,
    targetHeight
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        const url = URL.createObjectURL(blob);
        resolve(url);
      },
      'image/jpeg',
      0.95
    );
  });
}
