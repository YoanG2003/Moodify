import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

import { seededCrisisResources, seededQuotes, seededWellnessContent } from './content-data.js';

async function main() {
  if (!getApps().length) initializeApp({ credential: applicationDefault() });
  const db = getFirestore();
  const batch = db.batch();
  seededWellnessContent.forEach(({ id, ...content }) => {
    batch.set(db.doc(`content/${id}`), {
      ...content,
      updatedAt: FieldValue.serverTimestamp(),
    });
  });
  seededCrisisResources.forEach(({ id, ...resource }) => {
    batch.set(db.doc(`crisisResources/${id}`), {
      ...resource,
      updatedAt: FieldValue.serverTimestamp(),
    });
  });
  batch.set(db.doc('contentMeta/quotes'), {
    values: seededQuotes,
    updatedAt: FieldValue.serverTimestamp(),
  });
  await batch.commit();
  process.stdout.write(`Seeded ${seededWellnessContent.length} content records and ${seededCrisisResources.length} EU safety resource.\n`);
}

void main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`);
  process.exitCode = 1;
});
