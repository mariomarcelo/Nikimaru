import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export async function POST(req: Request) {
  // ... tu lógica de systemPrompt

  const result = await streamText({
    model: openai('gpt-4o'),
    messages,
    system: systemPrompt,
  });

  return result.toDataStreamResponse();
}

export async function POST(req: Request) {
  try {
    const { messages, currentMarketData } = await req.json();

    const result = await streamText({
      model: sdkOpenAI('gpt-4o'), // Usamos el cliente aquí
      messages,
      system: `Eres GenTrading. Analizando BTC a $${currentMarketData?.precio}. Huella: ${currentMarketData?.huellaActiva ? 'SI' : 'NO'}.`,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Revisar API Key" }), { status: 500 });
  }
}