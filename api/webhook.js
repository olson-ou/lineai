// /api/webhook.js
export default function handler(req, res) {
  if (req.method === 'POST') {
    console.log('✅ 收到 LINE 發來的 Webhook');
    res.status(200).send('OK');
  } else {
    res.status(405).send('Method Not Allowed');
  }
}
