export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  console.log('收到 LINE 發來的 Webhook');

  const event = req.body.events?.[0];
  if (!event) {
    console.log('沒有收到事件');
    return res.status(200).send('OK');
  }

  if (!event.replyToken) {
    console.log('沒有 replyToken');
    return res.status(200).send('OK');
  }

  if (!event.message) {
    console.log('沒有 message');
    return res.status(200).send('OK');
  }

  if (event.message.type !== 'text') {
    console.log('訊息類型不是文字:', event.message.type);
    return res.status(200).send('OK');
  }

  const userMessage = event.message.text;

  if (typeof userMessage !== 'string') {
    console.log('userMessage 不是字串:', userMessage);
    return res.status(200).send('OK');
  }

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
    console.error('回覆訊息失敗:', error);
    res.status(500).send('Server Error');
  }
}
