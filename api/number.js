import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(204).end();
  }

  const { number } = req.query;
  const key = req.query.key || req.query.slug || null;

  if (!number) {
    return res.status(400).json({
      status: "error",
      message: "number parameter required",
      developer: "abhi09hub",
      telegram: "https://t.me/NexoraField"
    });
  }

  if (!key) {
    return res.status(401).json({
      status: "error",
      message: "key required",
      developer: "abhi09hub",
      telegram: "https://t.me/NexoraField"
    });
  }

  let keysData;
  try {
    const keysPath = path.join(process.cwd(), 'keys.json');
    const raw = fs.readFileSync(keysPath, 'utf-8');
    keysData = JSON.parse(raw);
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "key database error",
      developer: "abhi09hub"
    });
  }

  const entry = keysData.keys.find(k => k.key === key);

  if (!entry) {
    return res.status(401).json({
      status: "error",
      message: "invalid key",
      developer: "@abhi09hub"
    });
  }

  if (entry.expires !== "never") {
    let expiry;
    if (entry.expires.includes('T')) {
      expiry = new Date(entry.expires + ':00+05:30');
    } else {
      expiry = new Date(entry.expires + 'T23:59:59+05:30');
    }
    const now = new Date();
    if (now > expiry) {
      return res.status(401).json({
        status: "error",
        message: "key expired",
        expired_on: entry.expires,
        developer: "@abhi09hub"
      });
    }
  }

  try {
    const upstream = await fetch(
      `https://numberinfo-api-adibhai.vercel.app/api/number?number=${encodeURIComponent(number)}`
    );
    const data = await upstream.json();

    return res.status(200).json({
      status: data.status || "success",
      number: data.number || number,
      data: data.data || null,
      developer: "abhi09hub",
      telegram: "https://t.me/NexoraField"
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "upstream fetch failed",
      developer: "abhi09hub",
      telegram: "https://t.me/NexoraField"
    });
  }
}
