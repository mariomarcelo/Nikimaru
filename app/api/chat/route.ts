import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Esto permite que la IA tarde hasta 30 segundos en responder si es necesario
export const maxDuration = 30;

export async function POST(req: Request) {
  // Recibimos los mensajes del chat
  const { messages } = await req.json();

  const result = await streamText({
    model: openai('gpt-4o'), // Usamos el cerebro más potente
    messages,
    system: `Eres Nikimaru, el mentor de trading institucional de Marius. 
    Tu misión es analizar el mercado de BTC usando Wyckoff y SMC. 
    - Si Marius pregunta por entradas, busca confirmación de la 'Huella'.
    - Tu tono es técnico, audaz y directo.
    - Recuerda siempre el riesgo máximo de $80 por operación.
    - No eres un bot genérico, eres Nikimaru, un trader experto.`,
  });

  return result.toDataStreamResponse();
}