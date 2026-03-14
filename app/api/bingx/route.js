import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req) {
  try {
    const { side, symbol, margin, leverage } = await req.json();

    const API_KEY = process.env.BINGX_API_KEY;
    const SECRET_KEY = process.env.BINGX_SECRET_KEY;

    if (!API_KEY || !SECRET_KEY) {
      return NextResponse.json({ msg: "ERROR: Llaves no detectadas en Vercel" }, { status: 401 });
    }

    const URL_BASE = "https://open-api-vst.bingx.com"; // CUENTA DEMO VST

    // Parámetros obligatorios en orden alfabético para evitar errores de firma
    const params = {
      leverage: String(leverage),
      positionSide: "BOTH",
      quantity: String(margin),
      recvWindow: "5000",
      side: String(side),
      symbol: String(symbol || "BTC-USDT"),
      timestamp: String(Date.now()),
      type: "MARKET"
    };

    // Construcción del Query String
    const queryString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');

    // Generación de la firma HMAC SHA256
    const signature = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(queryString)
      .digest('hex');

    const url = `${URL_BASE}/openApi/swap/v2/trade/order?${queryString}&signature=${signature}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'X-BX-APIKEY': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    // Si BingX responde con error 401 aquí, es que el Secret Key está mal copiado
    return NextResponse.json(data);

  } catch (error) {
    return NextResponse.json({ msg: "Error interno", error: error.message }, { status: 500 });
  }
}