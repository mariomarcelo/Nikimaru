import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const runtime = 'edge';

const sdkOpenAI = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? '',
});

export async function POST(req: Request) {
  try {
    const { messages, currentMarketData } = await req.json();

    // Extraemos variables para un sistema de prompts más limpio
    const { precio, huellaActiva, rayoDorado, temporalidad, direccionVela, tienesPosicion } = currentMarketData || {};

    const result = await streamText({
      model: sdkOpenAI('gpt-4o'),
      messages,
      system: `Eres GenTrading, un Mentor experto en Scalping Institucional para NIKIMARU V3.
      
      ESTADO ACTUAL DEL MERCADO:
      - Precio BTC: $${precio || 'Cargando...'}
      - Temporalidad: ${temporalidad}
      - Dirección de Vela: ${direccionVela}
      - Huella Detectada: ${huellaActiva ? 'SÍ (Flujo de órdenes detectado)' : 'NO (Mercado lateral/minorista)'}
      - RAYO DORADO: ${rayoDorado ? 'ACTIVO (ALTA PROBABILIDAD DE CAZA)' : 'INACTIVO'}
      - Estado del Cazador: ${tienesPosicion ? 'DENTRO DEL MERCADO' : 'BUSCANDO ENTRADA'}

      INSTRUCCIONES:
      1. Si rayoDorado es SÍ, sé agresivo y motiva al cazador a buscar la entrada en dirección ${direccionVela}.
      2. Si huellaActiva es NO, advierte sobre el riesgo de operar sin volumen institucional.
      3. Usa un tono técnico, conciso y motivador. Responde siempre en español.
      4. Mantén tus respuestas cortas (máximo 2-3 párrafos) para no saturar la terminal.`,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Revisar API Key o conexión de red" }), { status: 500 });
  }
}