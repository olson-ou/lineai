import { db } from './firebaseAdmin.js';

export async function getSoilMoisture() {
  try {
    const snapshot = await db.ref('soilData').limitToLast(1).once('value');
    const latestData = Object.values(snapshot.val() || {})[0];

    return latestData?.soil ?? null;
  } catch (error) {
    console.error('🔥 無法讀取土壤濕度:', error);
    return null;
  }
}
