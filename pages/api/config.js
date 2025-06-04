import fs from "fs";
import path from "path";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { minMoisture, maxMoisture } = req.body;

  // 驗證參數類型
  if (
    typeof minMoisture !== "number" ||
    typeof maxMoisture !== "number"
  ) {
    return res.status(400).json({ error: "無效的參數類型" });
  }

  const newConfig = { minMoisture, maxMoisture };

  // 找到 public/config.json 的完整路徑
  const filePath = path.join(process.cwd(), "public", "config.json");

  try {
    // 寫入新的設定值到 config.json
    fs.writeFileSync(filePath, JSON.stringify(newConfig, null, 2));

    return res.status(200).json({
      success: true,
      message: "設定已更新",
      config: newConfig,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "無法寫入設定檔",
      error: error.message,
    });
  }
}
