export default async function handler(req, res) {
  if (req.method === 'POST') {
    console.log('收到 LINE 發來的 Webhook');
    
    const lineReplyToken = req.body.events[0]?.replyToken;
    const userMessage = req.body.events[0]?.message?.text;

    // 模擬溫濕度資料
    const temperature = 28.5;
    const humidity = 60;

    let replyMessage = '抱歉，我不懂你的指令。';

    if (userMessage.includes('現在溫度')) {
      replyMessage = `目前的溫度是🌡️ ${temperature}°C`;
    } else if (userMessage.includes('現在濕度')) {
      replyMessage = `目前的濕度是💧 ${humidity}%`;
    }

    // 回覆用戶訊息
    await fetch('https://api.line.me/v2/bot/message/reply', {
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

    res.status(200).send('OK');
  } else {
    res.status(405).send('Method Not Allowed');
  }
}
