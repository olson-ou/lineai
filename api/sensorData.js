// 匯入 Firebase Admin SDK 初始化（需有 lib/firebaseAdmin.js）
import { db } from '../lib/firebaseAdmin.js';

export default async function handler(req, res) {
  try {
    const farmId = req.query.farmId || 'farm1'; // 預設為 farm1，可透過 URL 設定 ?farmId=farm2

    if (req.method === 'POST') {
      const { soil, humidity, temperature, motorStatus } = req.body;

      // 若全部欄位都沒填，回傳錯誤
      if (
        soil === undefined &&
        humidity === undefined &&
        temperature === undefined &&
        motorStatus === undefined
      ) {
        return res.status(400).json({ error: "缺少必要欄位" });
      }

      const timestamp = Date.now();
      const formattedTime = new Date(timestamp).toLocaleString('zh-TW', {
        timeZone: 'Asia/Taipei',
        hour12: false,
      });

      const sensorData = {
        soil: soil ?? null,
        humidity: humidity ?? null,
        temperature: temperature ?? null,
        motorStatus: motorStatus ?? "UNKNOWN",
        timestamp,
        formattedTime
      };

      // 儲存歷史資料
      await db.ref(`farms/${farmId}/sensorData/history`).push(sensorData);

      // 更新最新資料
      await db.ref(`farms/${farmId}/sensorData/latest`).set(sensorData);

      console.log(`✅ [${farmId}] 接收到感測資料：`, sensorData);
      return res.status(200).json({ message: "儲存成功" });
    }

    if (req.method === 'GET') {
      const snapshot = await db.ref(`farms/${farmId}/sensorData/latest`).once('value');
      const data = snapshot.val();

      // 檢查是否過期（5分鐘內有效）
      const currentTime = Date.now();
      const dataAge = currentTime - (data?.timestamp ?? 0);
      const maxAge = 5 * 60 * 1000; // 5分鐘

      if (!data) {
        return res.status(200).json({
          soil: null,
          humidity: null,
          temperature: null,
          motorStatus: "UNKNOWN",
          timestamp: null,
          formattedTime: null,
          message: "尚未接收到任何資料"
        });
      }

      if (dataAge > maxAge) {
        return res.status(200).json({
          soil: null,
          humidity: null,
          temperature: null,
          motorStatus: "UNKNOWN",
          timestamp: data.timestamp,
          formattedTime: data.formattedTime,
          message: "資料已過期"
        });
      }

      // 資料有效，回傳
      return res.status(200).json({
        soil: data.soil,
        humidity: data.humidity,
        temperature: data.temperature,
        motorStatus: data.motorStatus,
        timestamp: data.timestamp,
        formattedTime: data.formattedTime
      });
    }

    res.status(405).json({ error: "方法不允許" });
  } catch (error) {
    console.error('🔥 發生錯誤:', error);
    return res.status(500).json({ error: error.message });
  }
}
