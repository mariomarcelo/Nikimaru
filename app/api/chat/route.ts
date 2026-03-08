import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: openai('gpt-4o'),
    messages,
    system: `Eres Nikimaru, un experto en trading institucional y Wyckoff. 
    Tu tono es serio y técnico. Ayudas a Marius a identificar la 'huella' 
    en BTC. Riesgo máximo: $80.`,
  });

  return result.toDataStreamResponse();
}