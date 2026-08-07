---
trigger: always_on
description: 規範更新專案卡片資訊時必須遵循的步驟與修改位置，避免手動修改 HTML/JS 被覆蓋。
---

# 專案卡片手動更新規範

當需要新增專案或手動更新專案卡片（包含標題、簡介、技術標籤、彈窗詳細內容或圖片）時，**絕對不要**直接在 `index.html`、`assets/js/main.js` 或 `README.md` 的動態標記區間內進行手動編輯。請務必遵循以下規範：

## 1. 優先修改 [update_portfolio.py](file:///h:/GitFiles/tsz7250.github.io/scripts/update_portfolio.py)

你必須修改該腳本的以下三個位置：

*   **`METADATA_OVERRIDES` 字典**：
    *   新增或修改專案的鍵值（Key 為專案資料夾名稱）。
    *   欄位包含：`title`（中文化標題）、`meta`（Markdown 標籤）、`meta_html`（HTML 標籤）、`desc`（短描述）、`desc_html`（短描述 HTML 版本）、`longDesc`（彈窗詳細內容，可使用 HTML 標籤如 `<ul>` 與 `<li>`）。
*   **`MOCK_DATA` 陣列**：
    *   在對應的類別（`Side Projects`、`UG-Final Projects` 或 `UG-Homeworks`）之 `nodes` 列表中新增專案字典物件。
    *   格式範例：`{"name": "專案名稱", "url": "GitHub連結", "description": None, "primaryLanguage": {"name": "主語言"}}`。
*   **`main()` 函數中的 Mock 過濾條件**：
    *   依專案屬性，在 `is_personal`、`is_final` 或 `is_homework` 的名稱列表 `name in [...]` 中新增該專案名稱，以確保本地執行時能被正確對應。

## 2. 執行更新腳本

修改完成後，在工作目錄下執行以下指令以自動重新編譯與部署所有靜態檔案：

```bash
python scripts/update_portfolio.py
```

這將會自動且安全地更新以下三個檔案的標記區間：
*   [index.html](file:///h:/GitFiles/tsz7250.github.io/index.html) ：更新專案卡片 HTML。
*   [main.js](file:///h:/GitFiles/tsz7250.github.io/assets/js/main.js) ：更新彈窗資料陣列 `projects`。
*   [README.md](file:///h:/GitFiles/tsz7250.github.io/README.md) ：更新專案列表表格。
