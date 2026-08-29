import { httpsCallable } from 'firebase/functions';

import { createLocalAiReply } from '@/lib/chat-safety';
import { firebaseFunctions } from '@/services/firebase';

export interface AiReplyRequest {
  sessionId: string;
  message: string;
  locale: string;
  region: 'EU';
  previousResponseId?: string;
}

export interface AiReplyResponse {
  messageId: string;
  text: string;
  safetyMode: 'standard' | 'support' | 'crisis';
  expiresAt: string;
  responseId?: string;
}

export async function createAiReply(request: AiReplyRequest): Promise<AiReplyResponse> {
  if (!firebaseFunctions) return createLocalAiReply(request.message);
  const callable = httpsCallable<AiReplyRequest, AiReplyResponse>(firebaseFunctions, 'createAiReply');
  const response = await callable(request);
  return response.data;
}
