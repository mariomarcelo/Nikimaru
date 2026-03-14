import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req) {
  try {
    const { side, margin, leverage } = await req.json();
    const API_KEY = process.env.BINGX_API_KEY;
    const SECRET_KEY = process.env.BINGX_SECRET_KEY;

    // ESTO TE DIRÁ SI VERCEL LAS ESTÁ LEYENDO
    if (!API_KEY || !SECRET_KEY) {
      return NextResponse.json({ msg: "VERCEL_ERROR: Llaves vacías. Haz REDEPLOY sin caché." });
    }

    const URL_BASE = "https://open-api-vst.bingx.com";
    const params = {
      leverage: String(leverage),
      positionSide: "BOTH",
      quantity: String(margin),
      recvWindow: "5000",
      side: side,
      symbol: "BTC-USDT",
      timestamp: String(Date.now()),
      type: "MARKET"
    };

    const queryString = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&');
    const signature = crypto.createHmac('sha256', SECRET_KEY).update(queryString).digest('hex');

    const response = await fetch(`${URL_BASE}/openApi/swap/v2/trade/order?${queryString}&signature=${signature}`, {
      method: 'POST',
      headers: { 'X-BX-APIKEY': API_KEY, 'Content-Type': 'application/json' }
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ msg: "Error de servidor", error: e.message });
  }
}