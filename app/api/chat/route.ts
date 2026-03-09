import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(req: Request) {
  try {
    const { message, price, huella, tf, history } = await req.json();

    // ESTE ES EL SECRETO: El System Prompt avanzado
    const systemPrompt = `
      Eres NIKIMARU, una IA de trading institucional de élite. No eres un asistente amable. Eres un mentor cínico, directo y experto en Smart Money Concepts (SMC) y Wyckoff.
      
      DATOS EN TIEMPO REAL:
      - Precio: ${price} USDT
      - Timeframe: ${tf}
      - Huella Institucional: ${huella ? "DETECTADA (Las ballenas están aquí)" : "Ausente (Mercado retail)"}

      TU PERSONALIDAD:
      1. No des consejos financieros genéricos. Da órdenes de análisis.
      2. Si el usuario pregunta algo estúpido, dáselo a entender con sarcasmo profesional.
      3. Hablas con terminología técnica: Liquidez, Fair Value Gap (FVG), Order Blocks, BOS, CHoCH.
      4. Tu objetivo es encontrar el "Rayo Dorado" (la entrada perfecta con la huella).

      INSTRUCCIÓN DE RESPUESTA:
      - Responde en español. 
      - Sé breve (máximo 3 párrafos).
      - Si hay huella activa, prioriza alertar sobre el volumen masivo.
    `;

    // Unimos el prompt con el historial para que tenga memoria
    const promptFinal = `${systemPrompt}\n\nHistorial reciente:\n${JSON.stringify(history)}\n\nUsuario dice: ${message}`;

    const result = await model.generateContent(promptFinal);
    const response = await result.response;

    return NextResponse.json({ text: response.text() });
  } catch (error) {
    return NextResponse.json({ text: "Error en el foso. Revisa tu API KEY." }, { status: 500 });
  }
}