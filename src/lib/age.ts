import type { AgeBand } from '@/types/domain';

export function getAge(dateOfBirth: Date, now = new Date()): number {
  let age = now.getFullYear() - dateOfBirth.getFullYear();
  const month = now.getMonth() - dateOfBirth.getMonth();
  if (month < 0 || (month === 0 && now.getDate() < dateOfBirth.getDate())) age -= 1;
  return age;
}

export function validateAge(dateOfBirth: Date, now = new Date()): { eligible: boolean; ageBand?: AgeBand } {
  const age = getAge(dateOfBirth, now);
  if (Number.isNaN(age) || age < 0 || age > 120) return { eligible: false };
  if (age < 16) return { eligible: false };
  return { eligible: true, ageBand: age < 18 ? '16-17' : '18+' };
}
