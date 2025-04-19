// utils/cropAndResizeToSquare.js

import imageCompression from "browser-image-compression";

/**
 * Crop an image to a square (centered), resize it, and compress it.
 * @param {File} file - The original image file.
 * @param {number} targetSize - Final square size in px (e.g., 512).
 * @returns {Promise<File>} - The cropped and compressed image file.
 */
const cropAndResizeToSquare = async (file, targetSize) => {
  const img = new Image();
  const url = URL.createObjectURL(file);

  return new Promise((resolve, reject) => {
    img.onload = async () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = targetSize;
      canvas.height = targetSize;

      const side = Math.min(img.width, img.height);
      const sx = (img.width - side) / 2;
      const sy = (img.height - side) / 2;

      ctx.drawImage(
        img,
        sx, sy, side, side,
        0, 0, targetSize, targetSize
      );

      canvas.toBlob(async (blob) => {
        try {
          const squareFile = new File([blob], file.name, { type: file.type });

          // Compress with browser-image-compression
          const compressedFile = await imageCompression(squareFile, {
            maxSizeMB: 4.5,
            useWebWorker: true,
          });

          resolve(compressedFile);
        } catch (error) {
          reject(error);
        }
      }, file.type);
    };

    img.onerror = reject;
    img.src = url;
  });
};

export default cropAndResizeToSquare;
