# 專案指示

## 專案卡片更新規範

當需要新增專案或更新專案卡片（標題、簡介、技術標籤、彈窗詳細內容、圖片）時，**必讀並遵循** [.agents/rules/manual-update-card.md](.agents/rules/manual-update-card.md)。

**絕對不要**直接在 `index.html` 或 `assets/js/main.js` 的動態標記區間內手動編輯——一律修改 `scripts/update_portfolio.py` 後執行 `python scripts/update_portfolio.py` 重新生成。
