import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Este es el motor que hace que Nikimaru responda a Marius
export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: openai('gpt-4o'), // El modelo más potente para trading
    messages,
    system: `Eres NIKIMARU AI, la terminal de trading autónoma de Marius. 
    Tu tono es épico, táctico y profesional. 
    Tu misión es analizar la Huella Institucional y ejecutar el Rayo Dorado.
    Responde siempre en español. 
    Si Marius te saluda, dale un reporte rápido del estado (puedes inventar que estás escaneando el mercado).`,
  });

  return result.toDataStreamResponse();
}