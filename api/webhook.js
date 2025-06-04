import { getSensorData } from '../lib/getSensorData.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const events = req.body.events;
    if (!events || events.length === 0) return res.status(200).end();

    const replyToken = events[0].replyToken;
    const messageText = events[0].message?.text || '';

    let replyMsg = '請問您想查詢什麼？(ex:農場1狀況,請輸入"farm1")';

    // 預設農場為 farm1，可根據訊息文字切換
    let farmId = 'farm1';
    const matchFarm = messageText.match(/farm(\d+)/i);
    if (matchFarm) farmId = `farm${matchFarm[1]}`;
    if (matchFarm || messageText.includes('濕度') || messageText.includes('查詢')) {
      const data = await getSensorData(farmId);

      if (!data) {
        replyMsg = `❌ 找不到 ${farmId} 的資料`;
      } else if (data.expired) {
        replyMsg = `⚠️ ${farmId} 的資料已過期（最後更新於 ${data.formattedTime}）`;
      } else {
        replyMsg = `🌱 ${farmId} 感測資料如下：\n`
          + `土壤濕度：${data.soil ?? '無'}%\n`
          + `環境溫度：${data.temperature ?? '無'}°C\n`
          + `環境濕度：${data.humidity ?? '無'}%\n`
          + `pH 值：${data.ph ?? '無'}\n`
          + `CO₂ 狀態：${data.co2Status ?? '無'}\n`
          + `光照狀態：${data.lightStatus ?? '無'}\n`
          + `灑水狀態：${data.motorStatus}\n`
          + `風扇狀態：${data.fanStatus ?? '無'}\n`
          + `更新時間：${data.formattedTime}`;      
      }
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
