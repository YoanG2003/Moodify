import type { Habit, WellnessContent } from '@/types/domain';

const now = new Date().toISOString();

export const defaultHabits: Habit[] = [
  { id: 'sleeping', title: 'Sleeping', kind: 'sleep', target: 8, unit: 'hours', weekdays: [0,1,2,3,4,5,6], reminderEnabled: false, active: true, createdAt: now },
  { id: 'water', title: 'Water', kind: 'water', target: 2000, unit: 'ml', weekdays: [0,1,2,3,4,5,6], reminderEnabled: false, active: true, createdAt: now },
  { id: 'eating', title: 'Eating', kind: 'food', target: 3, unit: 'meals', weekdays: [0,1,2,3,4,5,6], reminderEnabled: false, active: true, createdAt: now },
  { id: 'workout', title: 'Workout', kind: 'workout', target: 30, unit: 'min', weekdays: [1,3,5], reminderEnabled: false, active: true, createdAt: now },
];

export const wellnessContent: WellnessContent[] = [
  {
    id: 'yoga', type: 'recommendation', category: 'Mind and Body', title: 'Yoga', subtitle: 'Mind and Body',
    description: 'A gentle reset that reconnects breath, posture, and attention.', durationMinutes: 10, icon: 'body', color: '#F7D8B7', tags: ['tense','tired','neutral'], published: true,
    blocks: [
      { type: 'step', text: 'Find a stable, comfortable position and soften your shoulders.' },
      { type: 'step', text: 'Move slowly through a forward fold, side stretch, and seated twist.' },
      { type: 'tip', text: 'Stop if anything hurts. Comfortable range is enough.' },
    ],
  },
  {
    id: 'nature', type: 'recommendation', category: 'Body', title: 'Be in nature', subtitle: 'Body',
    description: 'Use a short outdoor break to widen your attention and settle your pace.', durationMinutes: 15, icon: 'leaf', color: '#CDE6CF', tags: ['low','overwhelmed','neutral'], published: true,
    blocks: [
      { type: 'step', text: 'Choose a safe green space, balcony, or open window.' },
      { type: 'step', text: 'Notice three colors, two sounds, and one physical sensation.' },
      { type: 'tip', text: 'The goal is noticing, not forcing yourself to feel better.' },
    ],
  },
  {
    id: 'eating-habits', type: 'recommendation', category: 'Nutrition', title: 'Eating habits', subtitle: 'Body',
    description: 'A small planning exercise for more regular, supportive meals.', durationMinutes: 5, icon: 'nutrition', color: '#F7D3C9', tags: ['tired','low'], published: true,
    blocks: [
      { type: 'step', text: 'Check when you last ate and when your next meal is likely.' },
      { type: 'step', text: 'Pick one realistic snack or meal you can prepare today.' },
      { type: 'tip', text: 'Food needs vary. Seek professional guidance for medical nutrition concerns.' },
    ],
  },
  {
    id: 'paced-breathing', type: 'tool', category: 'Calm', title: 'Paced breathing', subtitle: 'For an overwhelmed moment',
    description: 'Follow a slow, even rhythm without holding your breath.', durationMinutes: 3, timerSeconds: 180, icon: 'wind', color: '#DCE8F7', tags: ['overwhelmed','anxious'], published: true,
    blocks: [{ type: 'step', text: 'Breathe in gently for four counts, then out for six.' }, { type: 'tip', text: 'Return to normal breathing if you feel light-headed.' }],
  },
  {
    id: 'grounding', type: 'tool', category: 'Calm', title: '5–4–3–2–1 grounding', subtitle: 'Reconnect with the present',
    description: 'Name things you can sense to bring attention back to your surroundings.', durationMinutes: 5, icon: 'eye', color: '#D9EDDE', tags: ['overwhelmed','anxious'], published: true,
    blocks: [{ type: 'step', text: 'Notice 5 things you see, 4 you feel, 3 you hear, 2 you smell, and 1 you taste.' }, { type: 'tip', text: 'Skip any sense that is uncomfortable or inaccessible.' }],
  },
  {
    id: 'decision-helper', type: 'tool', category: 'Reflect', title: 'Decision helper', subtitle: 'Make the next choice smaller',
    description: 'Compare realistic options without demanding a perfect answer.', durationMinutes: 8, icon: 'git-compare', color: '#F4E6BE', tags: ['stuck'], published: true,
    blocks: [{ type: 'step', text: 'Write the decision in one sentence and list no more than three options.' }, { type: 'step', text: 'For each option, note one benefit, one cost, and one reversible next step.' }],
  },
  {
    id: 'self-care-plan', type: 'tool', category: 'Support', title: 'Personal first-aid plan', subtitle: 'Plan support before you need it',
    description: 'Create a non-clinical list of people, places, and actions that help you feel safer.', durationMinutes: 10, icon: 'medkit', color: '#F8D5D1', tags: ['low'], published: true,
    blocks: [{ type: 'step', text: 'Add one person you can contact and one place where you feel safer.' }, { type: 'step', text: 'Add two small actions that have helped before.' }, { type: 'tip', text: 'For immediate danger in the EU, call 112.' }],
  },
  {
    id: 'movement', type: 'tool', category: 'Body', title: 'Short movement reset', subtitle: 'Gentle movement, no equipment',
    description: 'A brief sequence of mobility and light activity.', durationMinutes: 7, timerSeconds: 420, icon: 'walk', color: '#D9E7F3', tags: ['tired','tense'], published: true,
    blocks: [{ type: 'step', text: 'March comfortably for one minute, then circle shoulders and stretch calves.' }, { type: 'tip', text: 'Choose a pace where you can still speak comfortably.' }],
  },
];

export const quotes = [
  'The only way to do great work is to love what you do.',
  'Small steps still move you forward.',
  'You do not have to solve the whole day at once.',
];
