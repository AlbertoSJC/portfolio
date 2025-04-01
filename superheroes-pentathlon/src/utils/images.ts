export const resizeImage = (file: File, width: number, height: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context.'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const base64 = canvas.toDataURL('image/png');
        resolve(base64);
      };

      img.onerror = (err) => reject(err);
      img.src = e.target?.result as string;
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};
