import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req) {
  try {
    const { side, margin, leverage } = await req.json();
    const API_KEY = process.env.BINGX_API_KEY;
    const SECRET_KEY = process.env.BINGX_SECRET_KEY;

    if (!API_KEY || !SECRET_KEY) {
      return NextResponse.json({ msg: "VERCEL_ERROR: Llaves vacías." });
    }

    const URL_BASE = "https://open-api-vst.bingx.com";
    const PATH = "/openApi/swap/v2/trade/order";

    // Mapeamos el side por si acaso el botón envía algo distinto
    const bingXSide = side === 'BUY' || side === 'LONG' ? 'BUY' : 'SELL';

    const params = {
      symbol: "BTC-USDT",
      side: bingXSide,
      positionSide: "BOTH",
      type: "MARKET",
      quantity: String(margin), // BingX usa 'quantity' para el volumen/margen
      leverage: String(leverage),
      timestamp: String(Date.now()),
      recvWindow: "5000"
    };

    // 1. Construir query string ordenada alfabéticamente (Obligatorio para BingX)
    const queryString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');

    // 2. Crear la firma HMAC SHA256
    const signature = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(queryString)
      .digest('hex');

    // 3. Petición final
    const fullUrl = `${URL_BASE}${PATH}?${queryString}&signature=${signature}`;

    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'X-BX-APIKEY': API_KEY,
        'Accept': 'application/json'
      }
    });

    const data = await response.json();
    return NextResponse.json(data);

  } catch (e) {
    return NextResponse.json({ msg: "Error de servidor", error: e.message });
  }
}