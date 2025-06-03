// 匯入 Firebase Admin SDK 初始化（需有 lib/firebaseAdmin.js）
import { db } from '../lib/firebaseAdmin.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const { soil } = req.body;
      if (soil !== undefined) {
        const timestamp = Date.now();
        const formattedTime = new Date(timestamp).toLocaleString('zh-TW', {
        timeZone: 'Asia/Taipei',
        hour12: false
         });
        // 寫入 Realtime Database
        await db.ref('soilData').push({ soil, timestamp, formattedTime });

        console.log("✅ 接收到土壤濕度：", soil);
        return res.status(200).json({ message: "儲存成功" });
      }
      return res.status(400).json({ error: "缺少 soil 欄位" });
    }

    if (req.method === 'GET') {
      const snapshot = await db.ref('soilData').limitToLast(1).once('value');
      const latestData = Object.values(snapshot.val() || {})[0];

        return res.status(200).json({
        soil: latestData?.soil ?? null,
        formattedTime: latestData?.formattedTime ?? null
      });
    }

    res.status(405).json({ error: "方法不允許" });
  } catch (error) {
    console.error('🔥 發生錯誤:', error);
    return res.status(500).json({ error: error.message });
  }
}
