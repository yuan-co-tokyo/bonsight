export const USERS_PREFIX = 'users/';
const GRACE_MS = 24 * 60 * 60 * 1000;
export interface StoredObject {
  Key?: string;
  Size?: number;
  LastModified?: Date;
}
export async function listUserObjects(
  listPage: (token?: string) => Promise<{
    Contents?: StoredObject[];
    IsTruncated?: boolean;
    NextContinuationToken?: string;
  }>,
): Promise<StoredObject[]> {
  const objects: StoredObject[] = [];
  let token: string | undefined;
  const tokens = new Set<string>();
  do {
    const page = await listPage(token);
    objects.push(...(page.Contents ?? []));
    token = page.IsTruncated ? page.NextContinuationToken : undefined;
    if (page.IsTruncated && (!token || tokens.has(token)))
      throw new Error('Invalid S3 pagination token; stopped before deletion');
    if (token) tokens.add(token);
  } while (token);
  return objects;
}
export interface OrphanObject {
  key: string;
  size: number;
  lastModified: string;
}
export interface References {
  bonsais: { coverImageKey: string | null }[];
  media: { s3Key: string }[];
  checks: { photoKeys: string[] }[];
}
export function validateBucket(bucket: string): void {
  if (!/^bonsight-media-(dev|prod)-\d{12}$/.test(bucket))
    throw new Error(
      'Unexpected bucket: expected bonsight-media-{dev|prod}-{12-digit AWS account ID}',
    );
}
export function collectReferencedKeys(refs: References): Set<string> {
  return new Set([
    ...refs.bonsais.flatMap((b) => (b.coverImageKey ? [b.coverImageKey] : [])),
    ...refs.media.map((m) => m.s3Key),
    ...refs.checks.flatMap((c) => c.photoKeys),
  ]);
}
export function findOrphans(
  objects: StoredObject[],
  referenced: ReadonlySet<string>,
  now: Date,
): OrphanObject[] {
  if (!Number.isFinite(now.getTime())) throw new Error('Invalid scan time');
  const result: OrphanObject[] = [];
  for (const object of objects) {
    if (!object.Key?.startsWith(USERS_PREFIX) || object.Key === USERS_PREFIX)
      throw new Error(`Unexpected object prefix: ${object.Key ?? '(missing)'}`);
    // Unknown timestamps are retained, as are objects exactly 24 hours old.
    if (
      !object.LastModified ||
      !Number.isFinite(object.LastModified.getTime()) ||
      object.LastModified.getTime() >= now.getTime() - GRACE_MS ||
      referenced.has(object.Key)
    )
      continue;
    if (
      object.Size === undefined ||
      !Number.isSafeInteger(object.Size) ||
      object.Size < 0
    )
      throw new Error(`Invalid object size: ${object.Key}`);
    result.push({
      key: object.Key,
      size: object.Size,
      lastModified: object.LastModified.toISOString(),
    });
  }
  return result;
}
export function summarizeOrphans(objects: OrphanObject[]) {
  const prefixes: Record<string, number> = {};
  for (const object of objects) {
    // Group per user and object category, e.g. users/sub/covers/.
    const prefix = object.key.split('/').slice(0, 3).join('/') + '/';
    prefixes[prefix] = (prefixes[prefix] ?? 0) + 1;
  }
  return {
    count: objects.length,
    totalBytes: objects.reduce((sum, o) => sum + o.size, 0),
    prefixes,
  };
}
export function batches<T>(items: T[], size = 1000): T[][] {
  if (!Number.isInteger(size) || size < 1 || size > 1000)
    throw new Error('Batch size must be 1..1000');
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size)
    result.push(items.slice(i, i + size));
  return result;
}
interface DeleteResult {
  Deleted?: { Key?: string }[];
  Errors?: { Key?: string; Code?: string; Message?: string }[];
}
export async function deleteOrphans(
  objects: OrphanObject[],
  remove: (keys: string[]) => Promise<DeleteResult>,
  refreshReferences: () => Promise<ReadonlySet<string>>,
) {
  const failures: { key: string; message: string }[] = [];
  let deleted = 0;
  let skipped = 0;
  // Validate every candidate before any destructive operation.
  if (
    objects.some(
      (o) => !o.key.startsWith(USERS_PREFIX) || o.key === USERS_PREFIX,
    )
  )
    throw new Error('Unexpected object prefix');
  for (const batch of batches(objects)) {
    const referenced = await refreshReferences();
    const keys = batch.map((o) => o.key).filter((key) => !referenced.has(key));
    skipped += batch.length - keys.length;
    if (!keys.length) continue;
    try {
      const response = await remove(keys);
      const confirmed = new Set(response.Deleted?.map((item) => item.Key));
      for (const key of keys) {
        const error = response.Errors?.find((item) => item.Key === key);
        if (error || !confirmed.has(key))
          failures.push({
            key,
            message: error
              ? `${error.Code ?? 'Unknown'}: ${error.Message ?? ''}`
              : 'Deletion was not confirmed by S3',
          });
        else deleted++;
      }
    } catch (error) {
      failures.push(
        ...keys.map((key) => ({
          key,
          message: error instanceof Error ? error.message : String(error),
        })),
      );
    }
  }
  return { deleted, skipped, failures };
}
