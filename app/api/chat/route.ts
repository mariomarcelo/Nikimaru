import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Intentamos leer la clave del .env.local, si no, usamos un string vacío para evitar errores de compilación
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    // Recibimos los datos del chat y del mercado
    const { messages, price, huella, direction } = await req.json();

    // Configuramos el modelo de Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Personalidad de Nikimaru
    const systemPrompt = `
      Eres NIKIMARU AI. Tu misión es asistir al trader en español.
      DATOS ACTUALES DEL TERMINAL:
      - Precio BTC/USDT: ${price || 'Cargando...'}
      - Huella Institucional Detectada: ${huella ? 'SÍ (ALERTA)' : 'NO'}
      - Tendencia de vela: ${direction || 'Lateral'}
      
      INSTRUCCIONES:
      1. Si hay HUELLA detectada, menciona que el volumen institucional está presente.
      2. Sé técnico, breve y directo. 
      3. No uses un lenguaje demasiado robótico, ten personalidad de analista experto.
    `;

    // Tomamos el último mensaje del usuario
    const lastUserMessage = messages[messages.length - 1].content;

    // Generamos la respuesta combinando el contexto del mercado y la pregunta del usuario
    const result = await model.generateContent([systemPrompt, lastUserMessage]);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ text });

  } catch (error: any) {
    console.error("ERROR_IA_NIKIMARU:", error);
    return NextResponse.json({
      error: "Error en el cerebro de la IA",
      details: error.message
    }, { status: 500 });
  }
}