---
trigger: always_on
description: 規範更新專案卡片資訊時必須遵循的步驟與修改位置，避免手動修改 HTML/JS 被覆蓋。
---

# 專案卡片手動更新規範

當需要新增專案或手動更新專案卡片（包含標題、徽章、日期、標籤、簡介、彈窗詳細內容或圖片）時，**絕對不要**直接在 `index.html` 與 `assets/js/main.js` 的動態標記區間內進行手動編輯。請務必遵循以下規範：

## 1. 優先修改 [update_portfolio.py](file:///h:/GitFiles/tsz7250.github.io/scripts/update_portfolio.py)

你必須修改該腳本的以下兩個位置：

*   **`METADATA_OVERRIDES` 字典**：
    *   新增或修改專案的鍵值（Key 為專案名稱）。
    *   欄位包含：
        *   `title`：中文化標題。
        *   `category`：`"personal"` 或 `"academic"`（決定卡片分類與篩選）。
        *   `badge`：`"個人專案"`、`"學校專案 · 期末"` 或 `"學校專案 · 作業"`（決定徽章文字，亦用於分類還原）。
        *   `date`：日期字串，格式 `YYYY-MM`。
        *   `topics`：主題標籤列表（顯示於卡片，並寫入 `data-topics` 供篩選）。
        *   `tech`：技術標籤列表（顯示於卡片，並寫入 `data-tech` 供篩選）。
        *   `tags`：`topics` 與 `tech` 的合併列表（寫入 main.js 供篩選）。
        *   `meta`：Markdown 版標籤描述；`meta_html`：HTML 版標籤描述（彈窗使用，優先於 `meta`）。
        *   `desc`：短描述；`desc_html`：短描述 HTML 版（卡片使用，優先於 `desc`）。
        *   `longDesc`：彈窗詳細內容，可使用 HTML 標籤如 `<ul>` 與 `<li>`。
*   **`MOCK_DATA` 陣列**（本地無 Token 時的資料來源）：
    *   在對應類別的 `nodes` 列表中新增專案字典物件。三個類別名稱為：`"Side Projects"`（slug `side-projects`）、`"Academic Final Projects"`（slug `ug-final-projects`）、`"Academic Coursework"`（slug `ug-homeworks`）。
    *   格式範例：`{"name": "專案名稱", "url": "GitHub連結", "description": None, "primaryLanguage": {"name": "主語言"}}`。
*   **不需修改過濾條件**：若某類清單為空，`main()` 會自動依 `METADATA_OVERRIDES` 的 `category` 與 `badge` 欄位還原該類專案，因此只要上述兩處正確即可。

## 2. 執行更新腳本

修改完成後，在工作目錄下執行以下指令以自動重新編譯與部署所有靜態檔案：

```bash
python scripts/update_portfolio.py
```

### 資料來源行為

*   有設定環境變數 `GH_TOKEN` 或 `GITHUB_TOKEN` 時：從 GitHub GraphQL API 抓取使用者 Lists；若抓取失敗自動切換 Mock 模式。
*   無 Token 時：直接使用 `MOCK_DATA`。

### 腳本自動更新的檔案與區間

*   [index.html](file:///h:/GitFiles/tsz7250.github.io/index.html)：
    *   `<!-- START_PROJECTS_LIST -->` ～ `<!-- END_PROJECTS_LIST -->`：專案卡片 HTML。
    *   `<!-- START_LAST_MANUAL_UPDATE -->` ～ `<!-- END_LAST_MANUAL_UPDATE -->`：最後手動提交日期（由 `git log` 取得，排除含 "Auto-update" 的提交）。
    *   `<!-- START_LAST_AUTO_UPDATE -->` ～ `<!-- END_LAST_AUTO_UPDATE -->`：本次執行日期。
*   [main.js](file:///h:/GitFiles/tsz7250.github.io/assets/js/main.js)：
    *   `// START_PROJECTS_DATA` ～ `// END_PROJECTS_DATA`：彈窗資料陣列 `projects`。

## 3. 圖片與 URL 規則

*   **圖片**：將 `assets/img/portfolio/{專案名稱}.png` 放入對應路徑（檔名須與 `METADATA_OVERRIDES` 的 Key 相同）；若檔案不存在，卡片自動 fallback 為 `./assets/img/portfolio/default.svg`。
*   **URL**：學校專案（期末與作業）的 URL 會被腳本強制改寫為 `https://github.com/tsz7250/undergrad-archive/tree/main/{專案名稱}`；個人專案為 `https://github.com/tsz7250/{專案名稱}`。
