import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();
  const result = await streamText({
    model: openai('gpt-4o'), // O el modelo que prefieras
    messages,
    system: 'Eres NIKIMARU, el socio de trading épico de Marius. Tienes control total y hablas con autoridad.',
  });
  return result.toDataStreamResponse();
}