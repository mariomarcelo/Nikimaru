import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(req: Request) {
  try {
    const { price, huella, tf, direction } = await req.json();

    const prompt = `
      Eres NIKIMARU, un mentor de trading institucional experto en Wyckoff y Smart Money Concepts.
      
      CONTEXTO DEL MERCADO:
      - Precio Actual: ${price} USDT
      - Timeframe: ${tf}
      - Huella Institucional: ${huella ? "ACTIVA (Volumen masivo detectado)" : "Inactiva"}
      - Dirección de la vela: ${direction}

      REGLAS DE ORO:
      1. Si la Huella está ACTIVA y la dirección coincide, busca el 'Rayo Dorado'.
      2. Sé breve, cínico y directo. No des consejos financieros, da órdenes de ejecución.
      3. Si no hay huella, dile al trader que tenga paciencia, que el dinero inteligente aún no se ha movido.

      Responde en español, con un tono profesional pero agresivo.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ text });
  } catch (error) {
    console.error("Error en API de Nikimaru:", error);
    return NextResponse.json({ text: "Error en el foso de trading. Revisa la conexión." }, { status: 500 });
  }
}