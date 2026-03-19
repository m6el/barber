const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

export interface Topic {
  id: string;
  name: string;
  description: string;
}

async function apiFetch(path: string, token: string, options: RequestInit = {}) {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return res.json();
}

export async function getTopics(token: string): Promise<{ topics: Topic[] }> {
  return apiFetch('/api/ai/topics', token);
}

export async function sendChatMessage(
  token: string,
  messages: Message[],
  topic?: string
): Promise<{ reply: string }> {
  return apiFetch('/api/ai/chat', token, {
    method: 'POST',
    body: JSON.stringify({ messages, topic }),
  });
}

export async function explainConcept(
  token: string,
  concept: string,
  topic?: string,
  level: 'simple' | 'standard' | 'detailed' = 'standard'
): Promise<{ explanation: string }> {
  return apiFetch('/api/ai/explain', token, {
    method: 'POST',
    body: JSON.stringify({ concept, topic, level }),
  });
}

export async function generateQuiz(
  token: string,
  topic: string,
  count: number = 5,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): Promise<{ questions: QuizQuestion[] }> {
  return apiFetch('/api/ai/quiz', token, {
    method: 'POST',
    body: JSON.stringify({ topic, count, difficulty }),
  });
}

export async function getAnswerFeedback(
  token: string,
  question: string,
  studentAnswer: string,
  topic?: string
): Promise<{ feedback: string }> {
  return apiFetch('/api/ai/feedback', token, {
    method: 'POST',
    body: JSON.stringify({ question, studentAnswer, topic }),
  });
}
