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

    // Ajuste para Modo Cobertura (Hedge Mode)
    // side: 'BUY' abre un LONG | side: 'SELL' abre un SHORT
    const bingXSide = side === 'BUY' || side === 'LONG' ? 'BUY' : 'SELL';
    const bingXPositionSide = bingXSide === 'BUY' ? 'LONG' : 'SHORT';

    const params = {
      symbol: "BTC-USDT",
      side: bingXSide,
      positionSide: bingXPositionSide, // <--- AQUÍ ESTABA EL ERROR
      type: "MARKET",
      quantity: String(margin),
      leverage: String(leverage),
      timestamp: String(Date.now()),
      recvWindow: "5000"
    };

    // 1. Query string ordenada
    const queryString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');

    // 2. Firma HMAC SHA256
    const signature = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(queryString)
      .digest('hex');

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