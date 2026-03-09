import { OpenAIStream, StreamingTextResponse } from 'ai';
import { Configuration, OpenAIApi } from 'openai-edge';

const config = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(config);

export async function POST(req: Request) {
  const { messages, currentMarketData } = await req.json();

  // AQUÍ LE DAS TU PERSONALIDAD Y REGLAS
  const systemPrompt = `
    Eres el asistente del "Protocolo del Cazador". Tu biblia es la Metodología Wyckoff e ICT.
    Reglas estrictas:
    1. Si no hay volumen sobre la media, advierte que es "puto retail".
    2. Si el usuario está ansioso, recuérdale el Paso 5: "La Muerte de la Esperanza".
    3. Tu objetivo es que el usuario no opere si no hay Huella Institucional.
    
    Datos actuales del mercado: ${JSON.stringify(currentMarketData)}
  `;

  const response = await openai.createChatCompletion({
    model: 'gpt-4-turbo', // O gpt-4o para más velocidad
    stream: true,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages
    ],
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}