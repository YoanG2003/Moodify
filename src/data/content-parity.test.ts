import { seededWellnessContent } from '../../functions/src/content-data';
import { wellnessContent } from './seed';

test('keeps bundled and Firestore wellness content in sync', () => {
  const backendContent = seededWellnessContent.map(({ assetReference: _assetReference, ...content }) => content);
  expect(backendContent).toEqual(wellnessContent);
});
