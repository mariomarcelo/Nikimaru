import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: openai('gpt-4o'),
    messages,
    system: `Eres Nikimaru, un experto en trading institucional (SMC) y Wyckoff. 
    Tu misión es asistir a Marius. Eres directo, técnico y usas terminología de trading.`,
  });

  return result.toDataStreamResponse();
}