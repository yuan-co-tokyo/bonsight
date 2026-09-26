jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn(),
  PutObjectCommand: jest.fn((input: unknown) => input),
}));
jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockResolvedValue('https://upload.example'),
}));
import { ValidationPipe } from '@nestjs/common';
import { MediaService } from '../media/media.service';
import { PresignRequestDto } from '../media/dto/presign-request.dto';
it('盆栽登録なしで購入写真のpresignを取得できる', async () => {
  const pipe = new ValidationPipe({ whitelist: true, transform: true });
  const dto = (await pipe.transform(
    { type: 'purchase', filename: 'whole.jpg', contentType: 'image/jpeg' },
    { type: 'body', metatype: PresignRequestDto },
  )) as PresignRequestDto;
  const service = new MediaService({} as never);
  const result = await service.presign(dto, 'me');
  expect(result.s3Key).toMatch(/^users\/me\/purchase-checks\/\d+-whole\.jpg$/);
  expect(result.presignedUrl).toBe('https://upload.example');
});
