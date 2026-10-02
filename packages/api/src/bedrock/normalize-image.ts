import { BadRequestException } from '@nestjs/common';
import sharp from 'sharp';

/** Normalize only the AI input; the original object in S3 remains untouched. */
export async function normalizeImageForAi(
  bytes: Uint8Array,
): Promise<{ bytes: Uint8Array; format: 'jpeg' }> {
  try {
    const normalized = await sharp(bytes)
      .rotate()
      .resize({
        width: 1568,
        height: 1568,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85 })
      .toBuffer();
    if (normalized.length > 3750000)
      throw new Error('Normalized image exceeds AI limit');
    return { bytes: normalized, format: 'jpeg' };
  } catch {
    throw new BadRequestException(
      'この写真の形式はAI診断に対応していません。JPEG・PNG・WebPの写真を使ってください',
    );
  }
}
