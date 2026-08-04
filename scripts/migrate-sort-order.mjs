import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

const KEY_V1 = 'prompt-wall';
const KEY_V2 = 'prompt-wall:v2';

const raw = await redis.get(KEY_V1);
const v1Data = typeof raw === 'string' ? JSON.parse(raw) : raw;

if (!v1Data || !Array.isArray(v1Data.prompts)) {
  throw new Error(`v1 data at ${KEY_V1} is missing or has no prompts array`);
}

const v1Prompts = v1Data.prompts;

// v1 display order: pinnedOrder asc first, then unpinned by createdAt desc
const pinned = v1Prompts
  .filter((p) => p.pinnedOrder !== undefined)
  .sort((a, b) => a.pinnedOrder - b.pinnedOrder);
const unpinned = v1Prompts
  .filter((p) => p.pinnedOrder === undefined)
  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
const orderedV1 = [...pinned, ...unpinned];

// Assign order = 0..n-1, carry only v2 fields
const v2Prompts = orderedV1.map((p, index) => {
  const clean = {
    id: p.id,
    title: p.title,
    content: p.content,
    createdAt: p.createdAt,
    order: index,
  };
  if (p.updatedAt !== undefined) {
    clean.updatedAt = p.updatedAt;
  }
  return clean;
});

// Assertions
for (const p of v2Prompts) {
  if (p.pinnedOrder !== undefined) {
    throw new Error(`v2 prompt ${p.id} still has pinnedOrder`);
  }
}
for (let i = 0; i < v2Prompts.length; i++) {
  if (v2Prompts[i].order !== i) {
    throw new Error(`v2 prompt at index ${i} has order ${v2Prompts[i].order}, expected ${i}`);
  }
}

const v2Data = { schemaVersion: 2, prompts: v2Prompts };
await redis.set(KEY_V2, v2Data);

// Verification report
const totalV1 = v1Prompts.length;
const totalV2 = v2Prompts.length;
console.log('=== migration report ===');
console.log(`v1 total: ${totalV1}`);
console.log(`v2 total: ${totalV2}`);
if (totalV1 !== totalV2) {
  throw new Error(`count mismatch: v1=${totalV1} v2=${totalV2}`);
}

console.log('--- v1 display order (first 5) ---');
for (const p of orderedV1.slice(0, 5)) {
  console.log(`  [${p.pinnedOrder ?? '-'}] ${p.id} ${p.title}`);
}

console.log('--- v2 order (first 5) ---');
for (const p of v2Prompts.slice(0, 5)) {
  console.log(`  [${p.order}] ${p.id} ${p.title}`);
}

const pinnedInV2 = v2Prompts.filter((p) => 'pinnedOrder' in p);
console.log(`v2 prompts with pinnedOrder: ${pinnedInV2.length}`);
if (pinnedInV2.length > 0) {
  throw new Error('v2 contains pinnedOrder fields');
}

console.log('migration OK');
