// pages/api/config.js

import updateConfig from "../../lineai/api/updateConfig";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { minMoisture, maxMoisture } = req.body;

  const result = updateConfig({ minMoisture, maxMoisture });

  if (result.success) {
    res.status(200).json(result);
  } else {
    res.status(400).json(result);
  }
}
