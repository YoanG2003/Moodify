import { areAllStepsComplete, toggleCompletedStep } from './content-progress';

test('toggles checklist steps deterministically', () => {
  expect(toggleCompletedStep([3], 1)).toEqual([1, 3]);
  expect(toggleCompletedStep([1, 3], 1)).toEqual([3]);
});

test('requires every configured step before completing a checklist', () => {
  expect(areAllStepsComplete([0, 2], [0])).toBe(false);
  expect(areAllStepsComplete([0, 2], [0, 2])).toBe(true);
  expect(areAllStepsComplete([], [])).toBe(false);
});
