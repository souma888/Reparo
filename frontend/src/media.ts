export async function preparePhoto(file: File): Promise<string> {
  if (
    !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
    file.size > 8 * 1024 * 1024
  )
    throw new Error("Choose a JPEG, PNG, or WebP image under 8 MB.");
  const bitmap = await createImageBitmap(file);
  try {
    if (bitmap.width * bitmap.height > 50000000)
      throw new Error(
        "This image is too large to prepare. Choose a smaller photo.",
      );
    return imageData(bitmap, bitmap.width, bitmap.height);
  } finally {
    bitmap.close();
  }
}
export function imageData(
  source: CanvasImageSource,
  width: number,
  height: number,
) {
  if (!width || !height) throw new Error("The camera is not ready yet.");
  const scale = Math.min(1, 1200 / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const context = canvas.getContext("2d");
  if (!context)
    throw new Error("Image capture is unavailable in this browser.");
  context.drawImage(source, 0, 0, canvas.width, canvas.height);
  const photo = canvas.toDataURL("image/jpeg", 0.78);
  if (photo.length > 1800000)
    throw new Error(
      "The captured image is too large. Move farther away or upload a smaller image.",
    );
  return photo;
}
