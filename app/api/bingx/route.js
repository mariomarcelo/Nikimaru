import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req) {
  try {
    const { side, symbol, margin, leverage } = await req.json();
    const API_KEY = process.env.BINGX_API_KEY;
    const SECRET_KEY = process.env.BINGX_SECRET_KEY;
    const URL_BASE = "https://open-api-vst.bingx.com"; // URL DEMO

    const params = {
      symbol: symbol || "BTC-USDT",
      side: side,
      positionSide: "BOTH",
      type: "MARKET",
      quantity: String(margin),
      leverage: String(leverage),
      timestamp: String(Date.now()),
      recvWindow: "5000"
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
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}