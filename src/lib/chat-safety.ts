const crisisPattern = /\b(suicide|kill myself|end my life|hurt myself|self[- ]harm|can't go on)\b/i;

export function createLocalAiReply(message: string) {
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  if (crisisPattern.test(message)) {
    return {
      messageId: `local-${Date.now()}`,
      text: 'I’m really sorry you’re carrying this. I can’t provide emergency help. If you may act on these thoughts, call 112 now or go to the nearest emergency department. If you can, contact someone you trust and stay with them while you get help.',
      safetyMode: 'crisis' as const,
      expiresAt,
    };
  }
  return {
    messageId: `local-${Date.now()}`,
    text: 'Thank you for putting that into words. What feels most important right now: understanding the feeling, choosing one small next step, or finding a way to settle your body for a moment?',
    safetyMode: 'support' as const,
    expiresAt,
  };
}
