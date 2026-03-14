import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const body = await request.json();
    const { symbol, side, margin, leverage } = body;

    const API_KEY = process.env.BINGX_API_KEY;
    const SECRET_KEY = process.env.BINGX_SECRET_KEY;
    const URL_BASE = "https://open-api-vst.bingx.com"; // URL DEMO VST

    const params = {
      symbol: symbol || "BTC-USDT",
      side: side, // "BUY" o "SELL"
      positionSide: "BOTH",
      type: "MARKET",
      quantity: margin, // En VST suele ser cantidad de moneda o nominal
      leverage: leverage,
      timestamp: Date.now(),
    };

    // Crear Query String y Firma
    const queryString = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&');
    const signature = crypto.createHmac('sha256', SECRET_KEY).update(queryString).digest('hex');

    const response = await fetch(`${URL_BASE}/openApi/swap/v2/trade/order?${queryString}&signature=${signature}`, {
      method: 'POST',
      headers: {
        'X-BX-APIKEY': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    return NextResponse.json({ error: 'Error de red en el servidor' }, { status: 500 });
  }
}