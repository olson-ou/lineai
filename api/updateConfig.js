// lineai/api/updateConfig.js

export default function updateConfig({ minMoisture, maxMoisture }) {
  if (
    typeof minMoisture !== "number" ||
    typeof maxMoisture !== "number" ||
    minMoisture < 0 ||
    maxMoisture > 100 ||
    minMoisture >= maxMoisture
  ) {
    return {
      success: false,
      message: "Invalid values: min must be < max, both between 0~100.",
    };
  }

  const fs = require("fs");
  const path = require("path");

  const configPath = path.join(process.cwd(), "public/config.json");

  const newConfig = {
    minMoisture,
    maxMoisture,
  };

  try {
    fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2), "utf8");
    return {
      success: true,
      message: "✅ config.json 更新成功！",
    };
  } catch (err) {
    return {
      success: false,
      message: "❌ 寫入失敗：" + err.message,
    };
  }
}
