import sharp from 'sharp';
import { BadRequestException } from '@nestjs/common';
import { normalizeImageForAi } from './normalize-image';
const makeImage = (width: number, height: number) =>
  sharp({ create: { width, height, channels: 3, background: '#548241' } });
it.each([
  [4000, 3000, 1568, 1176],
  [640, 480, 640, 480],
])(
  'normalizes %sx%s without enlarging',
  async (width, height, targetWidth, targetHeight) => {
    const source = await makeImage(width, height).png().toBuffer();
    const normalized = await normalizeImageForAi(source);
    expect(normalized.format).toBe('jpeg');
    expect(normalized.bytes.length).toBeLessThanOrEqual(3750000);
    expect(await sharp(normalized.bytes).metadata()).toMatchObject({
      format: 'jpeg',
      width: targetWidth,
      height: targetHeight,
    });
    expect(await sharp(source).metadata()).toMatchObject({
      format: 'png',
      width,
      height,
    });
  },
);
it('applies EXIF orientation before stripping metadata', async () => {
  const source = await makeImage(800, 400)
    .jpeg()
    .withMetadata({ orientation: 6 })
    .toBuffer();
  const normalized = await normalizeImageForAi(source);
  const metadata = await sharp(normalized.bytes).metadata();
  expect(metadata).toMatchObject({ width: 400, height: 800 });
  expect(metadata.orientation).toBeUndefined();
});
it('rejects corrupt data with a helpful 400', async () => {
  await expect(
    normalizeImageForAi(new Uint8Array([1, 2, 3])),
  ).rejects.toBeInstanceOf(BadRequestException);
  await expect(normalizeImageForAi(new Uint8Array())).rejects.toThrow(
    'JPEG・PNG・WebP',
  );
});
