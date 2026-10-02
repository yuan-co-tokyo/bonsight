import {
  batches,
  listUserObjects,
  collectReferencedKeys,
  deleteOrphans,
  findOrphans,
  summarizeOrphans,
  validateBucket,
  type OrphanObject,
} from './orphan-s3';
const now = new Date('2026-10-03T00:00:00Z');
const old = new Date('2026-10-01T00:00:00Z');
const orphan = (i: number): OrphanObject => ({
  key: `users/me/photos/${i}.jpg`,
  size: 10,
  lastModified: old.toISOString(),
});
it('preserves cover, Media and every PurchaseCheck array key; excludes recent/unknown timestamps', () => {
  const referenced = collectReferencedKeys({
    bonsais: [
      { coverImageKey: 'users/me/covers/cover.jpg' },
      { coverImageKey: null },
    ],
    media: [{ s3Key: 'users/me/bonsai/b1/media.jpg' }],
    checks: [
      {
        photoKeys: [
          'users/me/purchase-checks/whole.jpg',
          'users/me/purchase-checks/base.jpg',
        ],
      },
    ],
  });
  const objects = [...referenced].map((Key) => ({
    Key,
    Size: 10,
    LastModified: old,
  }));
  objects.push({ Key: orphan(1).key, Size: 10, LastModified: old });
  objects.push({ Key: 'users/me/recent.jpg', Size: 10, LastModified: now });
  objects.push({
    Key: 'users/me/boundary.jpg',
    Size: 10,
    LastModified: new Date(now.getTime() - 86400000),
  });
  objects.push({
    Key: 'users/me/future.jpg',
    Size: 10,
    LastModified: new Date(now.getTime() + 1),
  });
  expect(
    findOrphans(
      [...objects, { Key: 'users/me/unknown.jpg', Size: 10 }],
      referenced,
      now,
    ),
  ).toEqual([orphan(1)]);
});
it('summarizes sizes and prefixes', () => {
  expect(
    summarizeOrphans([
      orphan(1),
      orphan(2),
      { ...orphan(3), key: 'users/other/covers/a.jpg' },
    ]),
  ).toEqual({
    count: 3,
    totalBytes: 30,
    prefixes: { 'users/me/photos/': 2, 'users/other/covers/': 1 },
  });
});
it.each([
  '',
  'unrelated-bucket',
  'bonsight-media-prod',
  'bonsight-media-prod-123456789012/other',
])('rejects unexpected bucket %s', (bucket) =>
  expect(() => validateBucket(bucket)).toThrow(),
);
it('accepts only the configured Bonsight media bucket pattern', () => {
  expect(() =>
    validateBucket('bonsight-media-prod-123456789012'),
  ).not.toThrow();
  expect(() => validateBucket('bonsight-media-dev-123456789012')).not.toThrow();
});
it.each(['other/file.jpg', 'users-not/file.jpg', undefined])(
  'stops on unexpected prefix %s',
  (Key) => {
    expect(() =>
      findOrphans([{ Key, Size: 1, LastModified: old }], new Set(), now),
    ).toThrow('prefix');
  },
);
it('splits 2001 deletions into 1000/1000/1 and deletes each key once', async () => {
  const items = Array.from({ length: 2001 }, (_, i) => orphan(i));
  expect(batches(items).map((batch) => batch.length)).toEqual([1000, 1000, 1]);
  const remove = jest.fn((keys: string[]) =>
    Promise.resolve({
      Deleted: keys.map((Key) => ({ Key })),
    }),
  );
  const refs = jest.fn(() => Promise.resolve(new Set<string>()));
  expect(await deleteOrphans(items, remove, refs)).toEqual({
    deleted: 2001,
    skipped: 0,
    failures: [],
  });
  expect(remove.mock.calls.map(([keys]) => keys.length)).toEqual([
    1000, 1000, 1,
  ]);
  expect(refs).toHaveBeenCalledTimes(3);
});
it('retains keys that gained DB references after the dry-run scan', async () => {
  const remove = jest.fn((keys: string[]) =>
    Promise.resolve({
      Deleted: keys.map((Key) => ({ Key })),
    }),
  );
  expect(
    await deleteOrphans([orphan(1)], remove, () =>
      Promise.resolve(new Set([orphan(1).key])),
    ),
  ).toEqual({ deleted: 0, skipped: 1, failures: [] });
  expect(remove).not.toHaveBeenCalled();
});
it('reports partial failures and missing confirmations', async () => {
  const result = await deleteOrphans(
    [orphan(1), orphan(2), orphan(3)],
    () =>
      Promise.resolve({
        Deleted: [{ Key: orphan(1).key }],
        Errors: [{ Key: orphan(2).key, Code: 'AccessDenied' }],
      }),
    () => Promise.resolve(new Set()),
  );
  expect(result.deleted).toBe(1);
  expect(result.failures.map((f) => f.key)).toEqual([
    orphan(2).key,
    orphan(3).key,
  ]);
});
it('reports all keys on request failure and continues the next batch', async () => {
  const remove = jest
    .fn((keys: string[]) =>
      Promise.resolve({ Deleted: keys.map((Key) => ({ Key })) }),
    )
    .mockRejectedValueOnce(new Error('network'));
  const result = await deleteOrphans(
    Array.from({ length: 1001 }, (_, i) => orphan(i)),
    remove,
    () => Promise.resolve(new Set()),
  );
  expect(result.deleted).toBe(1);
  expect(result.failures).toHaveLength(1000);
});
it('fails closed on a DB refresh error before deletion', async () => {
  const remove = jest.fn();
  await expect(
    deleteOrphans([orphan(1)], remove, () =>
      Promise.reject(new Error('DB unavailable')),
    ),
  ).rejects.toThrow('DB unavailable');
  expect(remove).not.toHaveBeenCalled();
});
it('validates all candidate prefixes before starting deletion', async () => {
  const remove = jest.fn();
  await expect(
    deleteOrphans(
      [orphan(1), { ...orphan(2), key: 'public/a.jpg' }],
      remove,
      () => Promise.resolve(new Set()),
    ),
  ).rejects.toThrow('prefix');
  expect(remove).not.toHaveBeenCalled();
});

it('reads every S3 page using its continuation token', async () => {
  const list = jest
    .fn<
      Promise<{
        Contents: { Key: string }[];
        IsTruncated: boolean;
        NextContinuationToken?: string;
      }>,
      [string?]
    >()
    .mockResolvedValueOnce({
      Contents: [{ Key: 'users/me/a.jpg' }],
      IsTruncated: true,
      NextContinuationToken: 'next',
    })
    .mockResolvedValueOnce({
      Contents: [{ Key: 'users/me/b.jpg' }],
      IsTruncated: false,
    });
  expect(await listUserObjects(list)).toHaveLength(2);
  expect(list).toHaveBeenNthCalledWith(1, undefined);
  expect(list).toHaveBeenNthCalledWith(2, 'next');
});
it('rejects broken pagination before a report can be used for deletion', async () => {
  await expect(
    listUserObjects(() => Promise.resolve({ IsTruncated: true })),
  ).rejects.toThrow('pagination');
  await expect(
    listUserObjects(() =>
      Promise.resolve({ IsTruncated: true, NextContinuationToken: 'same' }),
    ),
  ).rejects.toThrow('pagination');
});
