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

// 已有 v2 数据按 order 升序，沿用其顺序；否则按 createdAt 升序
const orderedV1 = v1Prompts.some((p) => p.order !== undefined)
  ? [...v1Prompts].sort((a, b) => a.order - b.order)
  : [...v1Prompts].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

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
  console.log(`  [${p.order ?? '-'}] ${p.id} ${p.title}`);
}

console.log('--- v2 order (first 5) ---');
for (const p of v2Prompts.slice(0, 5)) {
  console.log(`  [${p.order}] ${p.id} ${p.title}`);
}

console.log('migration OK');
