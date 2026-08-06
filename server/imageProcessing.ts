// Optimización de imágenes subidas por el admin (galería).
// Redimensiona a un ancho máximo razonable para web, convierte a WebP y
// elimina metadata EXIF (sharp no la conserva salvo que se pida explícitamente
// con .withMetadata()), lo que además reduce peso y evita filtrar datos como
// geolocalización de fotos tomadas con el celular.
//
// Si el archivo no es una imagen procesable por sharp (o falla la conversión
// por cualquier motivo), se devuelve el buffer original sin tocar para no
// romper la subida.

import sharp from "sharp";

const MAX_DIMENSION = 2000; // px, lado más largo. Suficiente para el lightbox a pantalla completa.
const WEBP_QUALITY = 82; // buen balance calidad/peso para fotos de galería

export type OptimizedImage = {
  buffer: Buffer;
  contentType: string;
  extension: string;
};

export async function optimizeImageForWeb(
  buffer: Buffer,
  contentType: string,
): Promise<OptimizedImage> {
  if (!contentType.startsWith("image/")) {
    // No es una imagen (o no sabemos el tipo): no tocar.
    return { buffer, contentType, extension: "" };
  }

  try {
    const optimized = await sharp(buffer)
      .rotate() // aplica la orientación EXIF antes de descartar la metadata
      .resize({
        width: MAX_DIMENSION,
        height: MAX_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();

    return { buffer: optimized, contentType: "image/webp", extension: "webp" };
  } catch (err) {
    console.error("[imageProcessing] No se pudo optimizar la imagen, se sube el original:", err);
    return { buffer, contentType, extension: "" };
  }
}
