import { getSoilMoisture } from '../utils/dataStore.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const events = req.body.events;
  if (!events || events.length === 0) return res.status(200).end();

  const replyToken = events[0].replyToken;
  const messageText = events[0].message?.text || '';

  let replyMsg = '請問您想查詢什麼？';

  if (messageText.includes('濕度')) {
    const value = getSoilMoisture();
    replyMsg = value !== null ? `目前土壤濕度為：${value.toFixed(1)}%` : '目前尚未接收到濕度資料';
  }

  // 回傳給LINE
  await fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
    },
    body: JSON.stringify({
      replyToken,
      messages: [{ type: 'text', text: replyMsg }]
    })
  });

  res.status(200).end();
}
