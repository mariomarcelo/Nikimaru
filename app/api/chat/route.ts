import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Esto permite que el servidor responda hasta en 30 segundos
export const maxDuration = 30;

export async function POST(req: Request) {
  // 1. Extraemos los mensajes y los datos del mercado del cuerpo de la petición
  const { messages, currentMarketData } = await req.json();

  // 2. Definimos el System Prompt (El cerebro del Mentor GenTrading)
  const systemPrompt = `
    Eres GenTrading, un mentor experto en trading institucional (SMC) y Metodología Wyckoff.
    Tu objetivo es auditar al usuario basándote en los libros de Rubén Villahermosa e ICT.

    DATOS EN TIEMPO REAL:
    - Precio Actual: ${currentMarketData?.precio || 'Desconocido'}
    - Huella Institucional: ${currentMarketData?.huellaActiva ? 'DETECTADA 🐋' : 'No detectada'}
    - Rayo Dorado: ${currentMarketData?.rayoDorado ? 'ACTIVO ⚡' : 'Inactivo'}
    - Temporalidad: ${currentMarketData?.temporalidad || '1m'}

    REGLAS DE ORO:
    1. Si no hay "Rayo Dorado", advierte que la probabilidad es baja.
    2. El riesgo máximo es de $80 USD por operación.
    3. Una vez alcanzado el 1:1, el Stop Loss DEBE ir a Break Even.
    4. Usa un tono serio, profesional y disciplinado.
  `;

  // 3. Ejecutamos la llamada a OpenAI
  const result = await streamText({
    model: openai('gpt-4o'), // O el modelo que prefieras (gpt-4o-mini es más barato)
    system: systemPrompt,
    messages,
  });

  // 4. Devolvemos la respuesta en formato stream
  return result.toDataStreamResponse();
}