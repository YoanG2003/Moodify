export type SeedContentBlock = Readonly<{
  type: 'paragraph' | 'step' | 'tip';
  text: string;
}>;

export type SeedWellnessContent = Readonly<{
  id: string;
  type: 'recommendation' | 'tool';
  category: string;
  title: string;
  subtitle: string;
  description: string;
  durationMinutes: number;
  icon: string;
  color: string;
  tags: readonly string[];
  blocks: readonly SeedContentBlock[];
  timerSeconds?: number;
  assetReference: string;
  published: true;
}>;

export const seededWellnessContent = [
  {
    id: 'yoga', type: 'recommendation', category: 'Mind and Body', title: 'Yoga', subtitle: 'Mind and Body',
    description: 'A gentle reset that reconnects breath, posture, and attention.', durationMinutes: 10, icon: 'body', color: '#F7D8B7', tags: ['tense', 'tired', 'neutral'], published: true,
    assetReference: 'figma:qxz9Y2sHORxxFa4j0xEWpP:791:160688#yoga',
    blocks: [
      { type: 'step', text: 'Find a stable, comfortable position and soften your shoulders.' },
      { type: 'step', text: 'Move slowly through a forward fold, side stretch, and seated twist.' },
      { type: 'tip', text: 'Stop if anything hurts. Comfortable range is enough.' },
    ],
  },
  {
    id: 'nature', type: 'recommendation', category: 'Body', title: 'Be in nature', subtitle: 'Body',
    description: 'Use a short outdoor break to widen your attention and settle your pace.', durationMinutes: 15, icon: 'leaf', color: '#CDE6CF', tags: ['low', 'overwhelmed', 'neutral'], published: true,
    assetReference: 'figma:qxz9Y2sHORxxFa4j0xEWpP:791:160688#nature',
    blocks: [
      { type: 'step', text: 'Choose a safe green space, balcony, or open window.' },
      { type: 'step', text: 'Notice three colors, two sounds, and one physical sensation.' },
      { type: 'tip', text: 'The goal is noticing, not forcing yourself to feel better.' },
    ],
  },
  {
    id: 'eating-habits', type: 'recommendation', category: 'Nutrition', title: 'Eating habits', subtitle: 'Body',
    description: 'A small planning exercise for more regular, supportive meals.', durationMinutes: 5, icon: 'nutrition', color: '#F7D3C9', tags: ['tired', 'low'], published: true,
    assetReference: 'figma:qxz9Y2sHORxxFa4j0xEWpP:791:160688#eating-habits',
    blocks: [
      { type: 'step', text: 'Check when you last ate and when your next meal is likely.' },
      { type: 'step', text: 'Pick one realistic snack or meal you can prepare today.' },
      { type: 'tip', text: 'Food needs vary. Seek professional guidance for medical nutrition concerns.' },
    ],
  },
  {
    id: 'paced-breathing', type: 'tool', category: 'Calm', title: 'Paced breathing', subtitle: 'For an overwhelmed moment',
    description: 'Follow a slow, even rhythm without holding your breath.', durationMinutes: 3, timerSeconds: 180, icon: 'pulse-outline', color: '#DCE8F7', tags: ['overwhelmed', 'anxious'], published: true,
    assetReference: 'figma:qxz9Y2sHORxxFa4j0xEWpP:791:162828',
    blocks: [
      { type: 'step', text: 'Breathe in gently for four counts, then out for six.' },
      { type: 'tip', text: 'Return to normal breathing if you feel light-headed.' },
    ],
  },
  {
    id: 'grounding', type: 'tool', category: 'Calm', title: '5–4–3–2–1 grounding', subtitle: 'Reconnect with the present',
    description: 'Name things you can sense to bring attention back to your surroundings.', durationMinutes: 5, icon: 'eye', color: '#D9EDDE', tags: ['overwhelmed', 'anxious'], published: true,
    assetReference: 'figma:qxz9Y2sHORxxFa4j0xEWpP:791:163695',
    blocks: [
      { type: 'step', text: 'Notice 5 things you see, 4 you feel, 3 you hear, 2 you smell, and 1 you taste.' },
      { type: 'tip', text: 'Skip any sense that is uncomfortable or inaccessible.' },
    ],
  },
  {
    id: 'decision-helper', type: 'tool', category: 'Reflect', title: 'Decision helper', subtitle: 'Make the next choice smaller',
    description: 'Compare realistic options without demanding a perfect answer.', durationMinutes: 8, icon: 'git-compare', color: '#F4E6BE', tags: ['stuck'], published: true,
    assetReference: 'figma:qxz9Y2sHORxxFa4j0xEWpP:791:163695#decision-helper',
    blocks: [
      { type: 'step', text: 'Write the decision in one sentence and list no more than three options.' },
      { type: 'step', text: 'For each option, note one benefit, one cost, and one reversible next step.' },
    ],
  },
  {
    id: 'self-care-plan', type: 'tool', category: 'Support', title: 'Personal self-care plan', subtitle: 'Plan support before you need it',
    description: 'Create a non-clinical list of people, places, and actions that help you feel safer.', durationMinutes: 10, icon: 'medkit', color: '#F8D5D1', tags: ['low'], published: true,
    assetReference: 'figma:qxz9Y2sHORxxFa4j0xEWpP:791:163820',
    blocks: [
      { type: 'step', text: 'Add one person you can contact and one place where you feel safer.' },
      { type: 'step', text: 'Add two small actions that have helped before.' },
      { type: 'tip', text: 'For immediate danger in the EU, call 112.' },
    ],
  },
  {
    id: 'movement', type: 'tool', category: 'Body', title: 'Short movement reset', subtitle: 'Gentle movement, no equipment',
    description: 'A brief sequence of mobility and light activity.', durationMinutes: 7, timerSeconds: 420, icon: 'walk', color: '#D9E7F3', tags: ['tired', 'tense'], published: true,
    assetReference: 'figma:qxz9Y2sHORxxFa4j0xEWpP:791:164078',
    blocks: [
      { type: 'step', text: 'March comfortably for one minute, then circle shoulders and stretch calves.' },
      { type: 'tip', text: 'Choose a pace where you can still speak comfortably.' },
    ],
  },
] as const satisfies readonly SeedWellnessContent[];

export const seededCrisisResources = [
  {
    id: 'eu',
    region: 'EU',
    locale: 'en',
    emergencyNumber: '112',
    emergencyLabel: 'European emergency services',
    message: 'If you or someone else may be in immediate danger, call 112 now or go to the nearest emergency department.',
    availability: 'Available free of charge throughout the European Union from fixed and mobile phones.',
    sourceUrl: 'https://digital-strategy.ec.europa.eu/en/policies/112',
    published: true,
  },
] as const;

export const seededQuotes = [
  'The only way to do great work is to love what you do.',
  'Small steps still move you forward.',
  'You do not have to solve the whole day at once.',
] as const;
