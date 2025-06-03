import { getSensorData } from '../lib/getSensorData.js'; 

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const events = req.body.events;
    if (!events || events.length === 0) return res.status(200).end();

    const replyToken = events[0].replyToken;
    const messageText = events[0].message?.text || '';

    let replyMsg = '請問您想查詢什麼？';

    if (messageText.includes('濕度')) {
      const value = await getsensorData();  // ✅ 這裡要加 await
      replyMsg = (value !== null && !isNaN(value))
        ? `目前土壤濕度為：${value.toFixed(1)}%`
        : '目前尚未接收到濕度資料';
    }

    // 回傳給 LINE
    const lineRes = await fetch('https://api.line.me/v2/bot/message/reply', {
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

    if (!lineRes.ok) {
      const errText = await lineRes.text();
      console.error('LINE 回傳失敗:', errText);
      return res.status(500).json({ message: 'LINE 回傳失敗', error: errText });
    }

    res.status(200).json({ message: '已成功回覆 LINE' });

  } catch (error) {
    console.error('Webhook 發生錯誤:', error);
    res.status(500).json({ message: 'Webhook 錯誤', error: error.message });
  }
}
