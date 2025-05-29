// /api/updateConfig.js

import { Octokit } from "octokit";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const owner = "olson-ou";  // 改成你的 GitHub 使用者名稱
const repo = "lineai";     // 改成你的 GitHub 倉庫名稱
const path = "config.json";
const branch = "main";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 取得目前的 config.json 資訊
    const { data: file } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      ref: branch,
    });

    const content = Buffer.from(file.content, "base64").toString("utf-8");
    const config = JSON.parse(content);

    // 取得使用者傳來的參數（POST）
    const { minMoisture, maxMoisture, wateringDuration } = req.body;

    // 更新對應欄位（若有提供）
    if (minMoisture !== undefined) config.minMoisture = parseFloat(minMoisture);
    if (maxMoisture !== undefined) config.maxMoisture = parseFloat(maxMoisture);
    if (wateringDuration !== undefined) config.wateringDuration = parseInt(wateringDuration);

    config.lastUpdated = new Date().toISOString();

    // 編碼成 base64
    const newContent = Buffer.from(JSON.stringify(config, null, 2)).toString("base64");

    // 更新檔案
    await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: "🔧 更新 config.json 設定值",
      content: newContent,
      sha: file.sha,
      branch,
    });

    res.status(200).json({ message: "✅ 設定更新成功", config });
  } catch (error) {
    console.error("更新錯誤:", error);
    res.status(500).json({ error: "❌ 無法更新設定檔" });
  }
}
