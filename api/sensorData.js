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
        await db.ref('sensorData').push({ soil, timestamp, formattedTime });

        console.log("✅ 接收到土壤濕度：", soil);
        return res.status(200).json({ message: "儲存成功" });
      }
      return res.status(400).json({ error: "缺少 soil 欄位" });
    }

    if (req.method === 'GET') {
      const snapshot = await db.ref('sensorData').limitToLast(1).once('value');
      const latestData = Object.values(snapshot.val() || {})[0];

      if (latestData && latestData.timestamp) {
        const currentTime = Date.now();
        const dataAge = currentTime - latestData.timestamp;
        const maxAge = 5 * 60 * 1000; // 5分鐘（300,000 毫秒）

        if (dataAge <= maxAge) {
          // ✅ 資料在有效期內
          return res.status(200).json({
            soil: latestData.soil,
            formattedTime: latestData.formattedTime
          });
        } else {
          // ❌ 資料過期
          return res.status(200).json({
            soil: null,
            formattedTime: null,
            message: '資料已過期'
          });
        }
      } else {
        // 沒有任何資料
        return res.status(200).json({
          soil: null,
          formattedTime: null,
          message: '尚未接收到任何資料'
        });
      }
    }

    res.status(405).json({ error: "方法不允許" });
  } catch (error) {
    console.error('🔥 發生錯誤:', error);
    return res.status(500).json({ error: error.message });
  }
}
