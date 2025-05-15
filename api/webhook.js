export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  console.log('收到 LINE 發來的 Webhook');

  const event = req.body.events?.[0];

  if (!event || !event.replyToken) {
    console.log('沒有事件或 replyToken');
    return res.status(200).send('OK');
  }

  // 確認是文字訊息，且 message.text 存在且是字串
  if (event.message?.type !== 'text' || typeof event.message.text !== 'string') {
    console.log('非文字訊息或文字訊息缺失，忽略');
    return res.status(200).send('OK');
  }

  const userMessage = event.message.text;

  const temperature = 28.5;
  const humidity = 60;

  let replyMessage = '抱歉，我不懂你的指令。';

  if (userMessage.includes('現在溫度')) {
    replyMessage = `目前溫度是 ${temperature}°C`;
  } else if (userMessage.includes('現在濕度')) {
    replyMessage = `目前濕度是 ${humidity}%`;
  }

  try {
    await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        replyToken: event.replyToken,
        messages: [{ type: 'text', text: replyMessage }],
      }),
    });
    res.status(200).send('OK');
  } catch (error) {
    console.error('發送回覆訊息失敗', error);
    res.status(500).send('Server Error');
  }
}
