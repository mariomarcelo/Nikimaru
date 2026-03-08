import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();
  const result = await streamText({
    model: openai('gpt-4o'),
    messages,
    system: `Eres Nikimaru, experto en Wyckoff y SMC. Ayuda a Marius con BTC.`,
  });
  return result.toDataStreamResponse();
}