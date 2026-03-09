import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

// ESTO ES CLAVE: Fuerza a Vercel a usar el entorno rápido (Edge)
export const runtime = 'edge';
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, currentMarketData } = await req.json();

    const systemPrompt = `
      Eres GenTrading, mentor rudo de la App "Más Volumen, Menos Rezos".
      Tu biblia: Wyckoff e ICT.
      
      CONTEXTO ACTUAL:
      - Precio: ${currentMarketData?.precio || 'S/D'}
      - Huella: ${currentMarketData?.huellaActiva ? 'ACTIVA' : 'INACTIVA'}
      - Rayo Dorado: ${currentMarketData?.rayoDorado ? 'SI' : 'NO'}

      REGLAS:
      1. Solo Precio y Volumen.
      2. Si no hay huella, no hay trade.
      3. Sé directo y cuida el capital ($80 max loss).
    `;

    const result = await streamText({
      model: openai('gpt-4o'),
      system: systemPrompt,
      messages,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error en Nikimaru AI:", error);
    return new Response(JSON.stringify({ error: "Error al conectar con el Mentor" }), { status: 500 });
  }
}