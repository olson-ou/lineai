import { setSoilMoisture, getSoilMoisture } from '../utils/dataStore.js';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { soil } = req.body;
    if (soil !== undefined) {
      setSoilMoisture(soil);
      console.log("接收到土壤濕度：", soil);
      return res.status(200).json({ message: "儲存成功" });
    }
    return res.status(400).json({ error: "缺少 soil 欄位" });
  }

  if (req.method === 'GET') {
    const value = getSoilMoisture();
    return res.status(200).json({ soil: value });
  }

  res.status(405).json({ error: "方法不允許" });
}
