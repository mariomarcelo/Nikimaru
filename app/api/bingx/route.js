import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const body = await request.json();
    const { symbol, side, margin, leverage } = body;

    const API_KEY = process.env.BINGX_API_KEY;
    const SECRET_KEY = process.env.BINGX_SECRET_KEY;

    // URL para cuenta DEMO VST
    const URL_BASE = "https://open-api-vst.bingx.com";

    // 1. Definir parámetros (Aseguramos que sean números donde corresponde)
    const params = {
      symbol: symbol || "BTC-USDT",
      side: side.toUpperCase(), // Asegurar que sea BUY o SELL
      positionSide: "BOTH",
      type: "MARKET",
      quantity: Number(margin),
      leverage: Number(leverage),
      timestamp: Date.now(),
      recvWindow: 5000, // Margen de 5 segundos para evitar el error de tiempo
    };

    // 2. Crear el Query String ordenado alfabéticamente
    const queryString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');

    // 3. Generar la firma HMAC SHA256
    const signature = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(queryString)
      .digest('hex');

    // 4. Construir la URL completa
    const fullUrl = `${URL_BASE}/openApi/swap/v2/trade/order?${queryString}&signature=${signature}`;

    // 5. Realizar la petición
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'X-BX-APIKEY': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    // Log para depuración en Vercel
    console.log("Respuesta de BingX:", data);

    return NextResponse.json(data);

  } catch (error) {
    console.error("Error en API Route:", error);
    return NextResponse.json({ error: 'Error interno del servidor', details: error.message }, { status: 500 });
  }
}