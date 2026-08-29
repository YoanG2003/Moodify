import { createLocalAiReply } from './chat-safety';

test('switches to crisis support and leads with the EU emergency number', () => {
  const reply = createLocalAiReply('I want to kill myself');

  expect(reply.safetyMode).toBe('crisis');
  expect(reply.text).toContain('112');
  expect(reply.text).toContain('someone you trust');
});

test('keeps ordinary reflection non-clinical', () => {
  const reply = createLocalAiReply('I feel overwhelmed about work');

  expect(reply.safetyMode).toBe('support');
  expect(reply.text).not.toMatch(/diagnos|therapist|treatment/i);
});
