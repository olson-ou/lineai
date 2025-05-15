export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  console.log('✅ 收到 LINE 發來的 Webhook');

  const event = req.body.events?.[0];

  // 檢查 event 是否存在
  if (!event || !event.message || !event.replyToken) {
    console.log('❌ 不支援的事件或缺少必要欄位');
    return res.status(200).send('OK'); // LINE 要求即使不處理也要回 200
  }

  const lineReplyToken = event.replyToken;
  const userMessage = event.message.text;

  // 如果不是文字訊息就跳過
  if (event.message.type !== 'text') {
    console.log('⚠️ 收到非文字訊息，略過');
    return res.status(200).send('OK');
  }

  // 模擬溫濕度資料
  const temperature = 28.5;
  const humidity = 60;

  let replyMessage = '🤖 抱歉，我不懂你的指令。你可以說「現在溫度」或「現在濕度」';

  // 判斷使用者指令
  if (userMessage.includes('現在溫度')) {
    replyMessage = `🌡️ 目前溫度是 ${temperature}°C`;
  } else if (userMessage.includes('現在濕度')) {
    replyMessage = `💧 目前濕度是 ${humidity}%`;
  }

  // 回覆用戶訊息
  try {
    const response = await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        replyToken: lineReplyToken,
        messages: [{
          type: 'text',
          text: replyMessage
        }]
      })
    });

    if (!response.ok) {
      console.error('❌ 回傳失敗', await response.text());
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('❌ 發送訊息時錯誤:', error);
    res.status(500).send('Server Error');
  }
}
