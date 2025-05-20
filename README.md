# LINE + ESP32 + 土壤濕度感測器

## 架構說明
ESP32 ➜ 上傳濕度資料至 `/api/soilmoisture`  
LINE Bot ➜ 使用者輸入「現在濕度」 ➜ webhook 回傳最新數值

## 上傳資料格式（ESP32）
