// Small, light versions of product photos for cards and lists:
// every photo in storage has one next to it, ending in "-sm.jpg".
export function thumbOf(url) {
  if (!url) return url;
  if (url.includes('/product-images/') && /\.jpg$/i.test(url) && !/-sm\.jpg$/i.test(url)) {
    return url.replace(/\.jpg$/i, '-sm.jpg');
  }
  return url;
}

// Resizes an image (File, Blob or URL) in the browser and returns a JPEG blob.
export function resizeToJpeg(source, max, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const objectUrl = typeof source === 'string' ? null : URL.createObjectURL(source);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onerror = () => reject(new Error('That file is not an image. Pick a JPG or PNG.'));
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('The photo could not be prepared.'))), 'image/jpeg', quality);
    };
    img.src = objectUrl || source;
  });
}
