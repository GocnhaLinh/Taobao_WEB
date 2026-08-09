/**
 * Compresses an image File using HTML5 Canvas before uploading.
 * - Keeps original file if it's not an image or already small (<= 300KB).
 * - Resizes max dimensions (default 1600px).
 * - Encodes JPEG with quality = 0.8 (80%).
 */
export const compressImage = async (
  file: File,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.8
): Promise<File> => {
  if (!file.type.startsWith('image/') || file.size <= 300 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      let { width, height } = img;

      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return resolve(file);
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            return resolve(file);
          }
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(compressedFile.size < file.size ? compressedFile : file);
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => resolve(file);
    reader.onerror = () => resolve(file);

    reader.readAsDataURL(file);
  });
};

export const compressImages = async (files: File[]): Promise<File[]> => {
  return Promise.all(files.map((file) => compressImage(file)));
};
