import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

const content = [
  ['yoga', 'recommendation', 'Mind and Body', 'Yoga', 'A gentle reset that reconnects breath, posture, and attention.', 10, ['tense', 'tired', 'neutral']],
  ['nature', 'recommendation', 'Body', 'Be in nature', 'Use a short outdoor break to widen your attention and settle your pace.', 15, ['low', 'overwhelmed', 'neutral']],
  ['eating-habits', 'recommendation', 'Nutrition', 'Eating habits', 'A small planning exercise for more regular, supportive meals.', 5, ['tired', 'low']],
  ['paced-breathing', 'tool', 'Calm', 'Paced breathing', 'Follow a slow, even rhythm without holding your breath.', 3, ['overwhelmed', 'anxious']],
  ['grounding', 'tool', 'Calm', '5–4–3–2–1 grounding', 'Name things you can sense to bring attention back to your surroundings.', 5, ['overwhelmed', 'anxious']],
  ['decision-helper', 'tool', 'Reflect', 'Decision helper', 'Compare realistic options without demanding a perfect answer.', 8, ['stuck']],
  ['self-care-plan', 'tool', 'Support', 'Personal first-aid plan', 'A non-clinical list of people, places, and actions that help you feel safer.', 10, ['low']],
  ['movement', 'tool', 'Body', 'Short movement reset', 'A brief sequence of mobility and light activity.', 7, ['tired', 'tense']],
] as const;

async function main() {
  if (!getApps().length) initializeApp({ credential: applicationDefault() });
  const db = getFirestore();
  const batch = db.batch();
  content.forEach(([id, type, category, title, description, durationMinutes, tags]) => {
    batch.set(db.doc(`content/${id}`), {
      type, category, title, subtitle: category, description, durationMinutes, tags,
      blocks: [], assetReference: `figma:${id}`, published: true,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
  });
  batch.set(db.doc('crisisResources/eu'), {
    region: 'EU', emergencyNumber: '112',
    message: 'If you or someone else may be in immediate danger, call 112 or go to the nearest emergency department.',
    published: true, updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });
  batch.set(db.doc('contentMeta/quotes'), {
    values: ['Small steps still move you forward.', 'You do not have to solve the whole day at once.'],
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });
  await batch.commit();
  process.stdout.write(`Seeded ${content.length} content records and EU safety resources.\n`);
}

void main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`);
  process.exitCode = 1;
});
