import 'dotenv/config';
import { writeFile } from 'node:fs/promises';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import {
  S3Client,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3';
import { PrismaClient } from '../generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  USERS_PREFIX,
  validateBucket,
  collectReferencedKeys,
  findOrphans,
  summarizeOrphans,
  deleteOrphans,
  listUserObjects,
} from '../src/maintenance/orphan-s3';

async function main() {
  const args = process.argv.slice(2);
  let execute = false;
  let yes = false;
  let output: string | undefined;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--execute') execute = true;
    else if (args[i] === '--yes') yes = true;
    else if (
      args[i] === '--output' &&
      args[i + 1] &&
      !args[i + 1].startsWith('--')
    )
      output = args[++i];
    else if (args[i] === '--help') {
      console.log(
        'cleanup:orphan-s3 [--output file.json] [--execute [--yes]]\nDefault: dry run. Only users/ objects older than 24 hours and unreferenced by DB are eligible.',
      );
      return;
    } else throw new Error(`Unknown or incomplete option: ${args[i]}`);
  }
  const bucket = process.env.S3_BUCKET_NAME ?? '';
  validateBucket(bucket);
  const databaseUrl = process.env.DATABASE_URL;
  const region = process.env.AWS_REGION;
  if (!databaseUrl || !region)
    throw new Error('DATABASE_URL and AWS_REGION are required');
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
  });
  const s3 = new S3Client({ region }); // AWS_PROFILE is resolved by the SDK credential chain.
  try {
    const readReferences = async () => {
      const [bonsais, media, checks] = await prisma.$transaction([
        prisma.bonsai.findMany({ select: { coverImageKey: true } }),
        prisma.media.findMany({ select: { s3Key: true } }),
        prisma.purchaseCheck.findMany({ select: { photoKeys: true } }),
      ]);
      return collectReferencedKeys({ bonsais, media, checks });
    };
    const referenced = await readReferences();
    const now = new Date();
    const objects = await listUserObjects((token) =>
      s3.send(
        new ListObjectsV2Command({
          Bucket: bucket,
          Prefix: USERS_PREFIX,
          ContinuationToken: token,
        }),
      ),
    );
    const orphans = findOrphans(objects, referenced, now);
    const report = {
      bucket,
      prefix: USERS_PREFIX,
      scannedAt: now.toISOString(),
      ...summarizeOrphans(orphans),
      objects: orphans,
    };
    console.log(
      JSON.stringify(
        { mode: execute ? 'execute' : 'dry-run', ...report },
        null,
        2,
      ),
    );
    if (output)
      await writeFile(output, JSON.stringify(report, null, 2) + '\n', {
        flag: 'wx',
        mode: 0o600,
      });
    if (!execute || !orphans.length) return;
    console.log(`Delete ${orphans.length} objects from bucket ${bucket}?`);
    if (!yes) {
      if (!stdin.isTTY)
        throw new Error(
          'Interactive confirmation requires a terminal. Review a dry run before using --yes.',
        );
      const prompt = createInterface({ input: stdin, output: stdout });
      try {
        if ((await prompt.question('Type yes to delete: ')).trim() !== 'yes') {
          console.log('Cancelled. No objects deleted.');
          return;
        }
      } finally {
        prompt.close();
      }
    }
    const result = await deleteOrphans(
      orphans,
      (keys) =>
        s3.send(
          new DeleteObjectsCommand({
            Bucket: bucket,
            Delete: { Objects: keys.map((Key) => ({ Key })), Quiet: false },
          }),
        ),
      readReferences,
    );
    console.log(JSON.stringify(result, null, 2));
    if (result.failures.length) process.exitCode = 1;
  } finally {
    s3.destroy();
    await prisma.$disconnect();
  }
}
void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
