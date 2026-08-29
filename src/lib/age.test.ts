import { getAge, validateAge } from './age';

const now = new Date('2026-08-28T12:00:00Z');

test('blocks a user until their sixteenth birthday', () => {
  expect(validateAge(new Date('2010-08-29T12:00:00Z'), now)).toEqual({ eligible: false });
  expect(validateAge(new Date('2010-08-28T12:00:00Z'), now)).toEqual({ eligible: true, ageBand: '16-17' });
});

test('handles birthdays that have not occurred this year', () => {
  expect(getAge(new Date('2000-12-01T12:00:00Z'), now)).toBe(25);
});
