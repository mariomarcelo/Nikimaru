import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// 1. Configuramos la KEY (Asegúrate de que esté en tu .env.local)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    // 2. Extraemos los datos que vienen de la burbuja
    const { messages, price, huella } = await req.json();

    // 3. Inicializamos el modelo
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 4. Preparamos el mensaje para la IA
    const prompt = `Analista técnico Nikimaru. 
    Precio actual: ${price} USDT. 
    Huella detectada: ${huella ? 'SÍ' : 'NO'}. 
    Pregunta del trader: ${messages[messages.length - 1].content}`;

    // 5. Generamos respuesta
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ text });

  } catch (error: any) {
    console.error("ERROR_NIKIMARU:", error);
    return NextResponse.json({ error: "Error de conexión con Gemini" }, { status: 500 });
  }
}