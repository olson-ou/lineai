import { db } from './firebaseAdmin.js';

export async function getSensorData(farmId = 'farm1') {
  try {
    const snapshot = await db.ref(`farms/${farmId}/sensorData/latest`).once('value');
    const data = snapshot.val();

    if (!data) return null;

    const now = Date.now();
    const diffMinutes = (now - (data.timestamp || 0)) / 60000;

    const expired = diffMinutes > 5; // 超過 5 分鐘視為過期

    return {
      soil: data.soil ?? null,
      humidity: data.humidity ?? null,
      temperature: data.temperature ?? null,
      motorStatus: data.motorStatus ?? "UNKNOWN",
      formattedTime: data.formattedTime ?? '',
      expired,
    };
  } catch (err) {
    console.error('取得感測資料錯誤：', err);
    return null;
  }
}
