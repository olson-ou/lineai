// lib/getMotorStatus.js
export async function getMotorStatus() {
  // 這邊寫你怎麼取得灑水器狀態的邏輯
  // 例如 fetch ESP32 API 回傳狀態
  try {
    const res = await fetch('http://你的ESP32IP/status');
    if (!res.ok) return null;
    const data = await res.json();
    return data.motorOn ? '開啟中' : '關閉中';
  } catch {
    return null;
  }
}
