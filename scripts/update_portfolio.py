import os
import sys
import json
import requests

# ---------------------------------------------------------
# 1. 專案自訂中文化標題與技術棧描述覆寫表 (Metadata Overrides)
# ---------------------------------------------------------
METADATA_OVERRIDES = {
    # 🚀 1. 個人專案
    "Currency_chart": {
        "title": "Currency_chart",
        "meta": "Python Flask, Chart.js",
        "desc": "多幣種匯率走勢圖，支援 7/30/90/180 天圖表、幣別搜尋與交換，背景資料自動更新。",
        "longDesc": "這是一個功能完整的匯率追蹤應用程式，使用 Python Flask 框架開發。系統使用 Playwright 和 Chromium 自動化瀏覽器來從 Mastercard 公開服務獲取匯率資料，並在背景自動更新。核心功能包括多時間區間圖表顯示（近 7/30/90/180 天）、幣別搜尋與快速交換介面、歷史記錄查看功能等。首次啟動時會自動檢查並更新匯率數據，如需獲取 Cookies 會自動顯示瀏覽器窗口約 10 秒，整個過程完全自動化。"
    },
    "yzuCourseBot": {
        "title": "yzuCourseBot",
        "meta": "Python",
        "desc": "元智大學自動選課機器人，針對 Windows 環境進行 Fork 優化版。",
        "longDesc": "這是一個針對元智大學選課系統開發的自動化工具，基於原始 yzuCourseBot 進行 fork 並針對 Windows 環境進行深度優化。主要改進包括：<ul><li>更新套件相容性以支援 Python 3.12。</li><li>修正 Windows 平台的依賴問題。</li><li>提供完整的 Windows 安裝指南。</li><li>優化執行穩定性。</li><li>新增可執行檔降低使用門檻。</li></ul>專案提供兩種執行方式：使用 Flet 框架開發的 GUI 圖形介面版本，以及傳統的命令列版本。驗證碼識別使用 CNN 模型進行 OCR 識別。我還使用 PyInstaller 將程式打包成 .exe 執行檔，並建立了自動化建置流程。這個專案幫助許多同學在選課期間節省了大量時間。"
    },
    "add-subtitles-extended": {
        "title": "add-subtitles-extended",
        "meta": "JavaScript (Web Ext)",
        "desc": "瀏覽器字幕插件擴充版，修復原版缺陷並新增簡繁自動轉換功能。",
        "longDesc": "這是一個 Firefox 瀏覽器擴充套件，基於原始 add-subtitles 進行修復及優化。主要功能是為網頁上的任何 video 元素新增外部字幕檔案。我新增了多項功能：<ul><li>支援 ASS/SSA 字幕格式（原本只支援 SRT、VTT）。</li><li>使用 OpenCC-JS 實現自動簡體中文轉繁體中文。</li><li>支援 ZIP 壓縮檔中的字幕（使用 JSZip 函式庫）。</li><li>修復全螢幕播放功能。</li><li>改善外觀設計。</li></ul>同時，我重構了內容腳本注入邏輯，增加錯誤處理與狀態檢查，優化 OpenCC 加載流程，修復了字幕上傳功能。使用者可以調整字幕位置、大小和顏色，並使用鍵盤快捷鍵控制。"
    },
    "Coursio": {
        "title": "Coursio",
        "meta": "Electron",
        "desc": "基於 WannaClass 框架進行重構與優化的課表查詢與自動選課桌面應用。",
        "longDesc": "本專案參考 Wanna Class 進行架構重構與功能擴充，打造一個現代化的元智大學選課助手。技術架構由原始的 Vanilla JS + jQuery 升級為 Vue 3 + Vite + SCSS，並使用 Electron 封裝為桌面應用程式。主要功能包括：<ul><li><strong>我的課表</strong>：直觀記錄歷年課程，支援匯出功能。</li><li><strong>課程查詢</strong>：快速檢索全校課表，顯示學分、教室及教授等詳細資訊。</li><li><strong>自動選課</strong>：模擬使用者行為進行全自動化搶課，大幅提升成功率。</li><li><strong>成績查詢</strong>：快速檢閱各學期成績紀錄。</li><li><strong>系統設定</strong>：彈性調整重試頻率與登入偏好。</li></ul>專案強調安全性與效能，承諾不紀錄帳號密碼，並優化資源消耗。透過 SQLite3 管理資料並整合 Puppeteer 處理網頁自動化，有效解決了官網操作繁瑣與驗證碼搜尋的痛點。"
    },
    "n8n-launcher": {
        "title": "n8n-launcher",
        "meta": "Batchfile, Docker",
        "desc": "Windows 的 n8n Docker 容器圖形化管理工具，支援一鍵啟動、自動配置、備份與還原。",
        "longDesc": "這是一個專為 Windows 系統設計的 n8n Docker 容器管理工具，提供簡單易用的圖形化選單介面來管理 n8n 工作流程自動化平台。主要功能包括：<ul><li><strong>一鍵啟動</strong>：自動檢查並啟動 Docker，無需手動配置。</li><li><strong>自動配置</strong>：首次使用時自動建立 docker-compose.yml 配置檔。</li><li><strong>資料備份</strong>：一鍵備份 n8n 工作流程和 PostgreSQL 資料庫。</li><li><strong>資料還原</strong>：輕鬆還原先前備份的資料。</li><li><strong>重新安裝</strong>：快速重新安裝並可選擇保留資料。</li></ul>工具使用 Batch 腳本開發，整合 Docker Compose 來管理容器生命週期。腳本會自動檢查 Docker Desktop 運行狀態，提供友好的錯誤提示，並在服務就緒後自動開啟瀏覽器。"
    },
    "ezoe-work_scraper": {
        "title": "ezoe-work_scraper",
        "meta": "Python, Scrapy",
        "desc": "書籍抓取與格式化匯出工具，支援批量爬取、簡繁轉換並合成為 DOCX/PDF。",
        "longDesc": "這是一個針對 ezoe.work 網站的文章爬蟲工具，可以批次抓取文章並輸出為格式化的 DOCX 與 PDF 檔案。主要功能包括：<ul><li><strong>批次爬取</strong>：從 urls.txt 或指定 txt 檔案讀取 URL，每篇產生獨立的 Markdown 檔案（書名_篇數.md）。</li><li><strong>合併轉換</strong>：依書名自動合併多篇 Markdown，轉成一本完整的 DOCX 檔案，可設定行距、標題樣式等格式。</li><li><strong>簡轉繁與 PDF</strong>：程式會將 DOCX 以 Microsoft Word 進行簡體轉繁體，並轉成 PDF 檔案。需在 Windows 環境且已安裝 Microsoft Word，否則會略過此步驟。</li><li><strong>一鍵流程</strong>：執行 main.py 可依序完成「爬取 → 轉 DOCX/PDF」的完整流程。</li></ul>技術上使用 Python 開發，整合 BeautifulSoup 進行網頁解析、pypandoc 進行 Markdown 轉 DOCX、pywin32 進行 Word 自動化操作（簡轉繁與 PDF 轉換）。"
    },
    "bible-tracker": {
        "title": "bible-tracker",
        "meta": "LINE Bot, Google Apps Script",
        "desc": "以 LINE Bot 結合 GAS 打造的讀經進度紀錄應用，支援群組統計與完成度排名。",
        "longDesc": "這是一個以 LINE Bot + Google Apps Script (GAS) 打造的聖經與生命讀經進度追蹤應用。系統幫助小組成員記錄每日讀經、自動同步一年讀經計畫與對應的生命讀經篇目，並即時統計群組排名。主要功能包括：<ul><li><strong>多元記錄模式</strong>：支援自由讀經、一年計畫與生命讀經的獨立勾選與智慧同步。</li><li><strong>進度儀表板</strong>：即時視覺化舊約、新約及生命讀經的完成百分比。</li><li><strong>群組互動</strong>：透過 LINE Bot 取得專屬連結，並查看成員間的閱讀比例與即時排名。</li><li><strong>安全與優化</strong>：實作 SHA-256 加密的 PIN 碼驗證，並提供批次儲存邏輯以提升使用者體驗。</li></ul>專案整合了 LINE Messaging API 與 Google Sheets，展現了如何利用雲端工具解決社群協作與個人進度管理的需求。"
    },
    # 👥 2. 期末分組報告
    "1131_Chatbot_Final": {
        "title": "電影AI助手聊天機器人",
        "meta": "微型應用程式設計實務<br>`Line Bot`, `Gemini`, `TMDB API`",
        "meta_html": "微型應用程式設計實務 ｜ Line Bot, Gemini, TMDB API",
        "desc": "電影多模態 AI 助手，整合智能對話、電影搜尋、圖片識別和字幕翻譯等功能。",
        "longDesc": "這是一個期末分組報告專案，我們開發了一個功能豐富的多模態 AI 聊天機器人，專門提供電影相關服務。系統提供四大聊天模式：<ul><li><strong>聊天模式 (GEMINI)</strong>：與 Google Gemini AI 進行自然語言對話。</li><li><strong>電影查詢 (SEARCH_MOVIE)</strong>：搜尋 TMDB 電影資料庫獲取詳細資訊。</li><li><strong>以圖搜片 (GUESS_MOVIE)</strong>：上傳電影劇照或海報讓 AI 自動識別。</li><li><strong>字幕翻譯 (SUB_TRANSLATE)</strong>：自動生成影片字幕並翻譯成多國語言。</li></ul>技術架構使用 Flask 作為後端框架，整合 Google Gemini、LINE Bot SDK、Microsoft Azure (翻譯、語音、語言分析)、TMDB API，並使用 FFmpeg 處理多媒體檔案。系統支援 LINE Bot 和網頁版雙重介面，能夠處理圖片、音訊、影片等多媒體檔案，實現即時字幕生成與嵌入。專案採用模組化架構設計，將各功能封裝成獨立模組，便於維護與擴展。"
    },
    "1122_Web_Final": {
        "title": "卡利西里餐廳訂餐系統",
        "meta": "網站程式設計實務<br>`Flask`, `PlotlyJS`, `Gemini`, `Canvas`",
        "meta_html": "網站程式設計實務 ｜ Flask, PlotlyJS, Gemini",
        "desc": "使用 Python Flask 開發的餐廳訂餐系統模擬應用程式，具備數據視覺化與智慧選餐。",
        "longDesc": "這是一個完整的餐廳訂餐模擬系統，使用 Python Flask 作為後端框架開發的期末分組報告專案。系統提供完整的點餐功能：<ul><li><strong>直接點餐</strong>：瀏覽完整菜單並選擇餐點。</li><li><strong>隨機點餐系統</strong>：智能推薦功能。</li><li><strong>購物車管理</strong>：即時管理訂單內容和總價計算。</li><li><strong>智能聊天機器人</strong>：整合 Google Gemini AI 與 LangChain 框架，可以回答用戶關於餐點的問題並提供個性化推薦。</li><li><strong>數據分析</strong>：使用 Pandas 處理銷售數據，並使用 PlotlyJS 繪製互動式圖表，實現多維度分析（按餐點類型、時間等維度）。</li><li><strong>營業管理模擬</strong>：包括公休時間設定、即時營業狀態更新、營業時間智能提醒。</li></ul>前端使用 HTML5 Canvas 實現創新的視覺效果，並採用響應式設計支援桌面和行動裝置。數據儲存使用 JSON 格式儲存菜單和配置數據，CSV 格式儲存銷售數據。"
    },
    "1111_WebProgramming_Final": {
        "title": "隨機選擇器與記帳系統",
        "meta": "Web 程式設計<br>`HTML`, `CSS`, `JS`, `PHP`, `MySQL`",
        "meta_html": "Web 程式設計 ｜ HTML, CSS, JS, PHP, MySQL",
        "desc": "結合食物與餐廳篩選的學餐隨機選擇器，並內建使用者註冊與個人記帳功能。",
        "longDesc": "這是一個校園美食隨機選擇器系統，作為 Web 程式設計課程的期末專題報告。系統提供以下功能：<ul><li><strong>隨機選擇功能</strong>：支援食物類別和餐廳類型的多層級篩選，智能推薦演算法幫助學生快速決定要吃什麼。</li><li><strong>用戶管理系統</strong>：包括用戶註冊、登入驗證、會話管理（使用 PHP Session），並實現了密碼加密與 SQL 注入防護等安全性措施。</li><li><strong>記帳系統</strong>：讓使用者可以記錄每次消費金額，支援依食物類別統計支出、依日期範圍查詢記錄、計算總消費金額等功能。</li><li><strong>歷史功能</strong>：可以查看過去的選擇記錄和消費明細，並提供視覺化消費趨勢圖表。</li></ul>技術架構使用 HTML/CSS/JavaScript 處理前端，PHP 處理後端邏輯，MySQL 資料庫儲存資料，採用正規化的資料表結構設計。系統採用響應式設計，支援手機和電腦使用。"
    },
    # 📚 3. 課程作業與實驗
    "1131_Chatbot": {
        "title": "1131 - 微型應用程式設計實務",
        "meta": "微型應用程式設計實務 ｜ Line Bot, Flask, Gemini, Azure, LangChain",
        "desc": "AI 聊天機器人集合（包含網頁聊天室、Line Bot、情感分析、語音轉換、LangChain 等）。",
        "desc_html": "AI 聊天機器人集合：包含 Gemini 網頁聊天機器人、Line Bot、情感分析機器人、翻譯機器人、文字轉語音機器人等。",
        "longDesc": "這門課程的作業整合了 9 個 AI 聊天機器人和微型應用程式專案，讓我對不同 AI 服務的整合有了深入理解。專案包含：<ul><li><strong>LLM_Chatbot</strong>：使用 Google Gemini API 建立的網頁版聊天機器人，具備安全設定 and 對話功能。</li><li><strong>LLM_Line</strong>：整合 Gemini API 的 Line Bot，提供智能對話服務。</li><li><strong>LangChain</strong>：基於 LangChain 框架開發的 AI 應用程式。</li><li><strong>SentimentAnalysis</strong>：使用 Microsoft Language Service 進行情感分析，判斷文字的正向、負向或中性情緒。</li><li><strong>TextToSpeech</strong>：整合 Azure Translation 和 Speech Services 的 Line Bot，提供文字翻譯和語音合成功能。</li><li><strong>TranslatorBot</strong>：使用 Azure Translation Service 的多語言翻譯服務。</li><li><strong>TranslatorBot(+voice)</strong>：進階版翻譯機器人，支援語音輸入和語音輸出。</li><li><strong>TranslatorWeb</strong>：基於 Flask 的網頁翻譯應用程式，整合 Azure 翻譯和語音服務。</li><li><strong>GeminiSafetySetting</strong>：展示 Google Gemini API 的安全設定範例。</li></ul>技術棧使用 Python 開發，整合 Flask 框架、Google Gemini API、Microsoft Azure Cognitive Services、LangChain，以及 Line Messaging API。"
    },
    "1121_LinearAlgebra": {
        "title": "1121 - 線性代數",
        "meta": "線性代數 ｜ C#, C++, LINGO",
        "desc": "線性代數應用（整數線性規劃 ILP、C# 幾何測量系統、點燈遊戲、RREF 計算器）。",
        "desc_html": "線性代數應用專案：整數線性規劃 (ILP)、C# 幾何測量系統、點燈遊戲、RREF 簡化階梯形矩陣計算器。",
        "longDesc": "這門課程的作業展示了線性代數在實際程式設計中的應用，包含 4 個專案：<ul><li><strong>ILP 專案</strong>：使用 C++ 生成整數線性規劃問題，並使用 LINGO 軟體解決圖形二分割問題，學習如何將實際問題轉化為數學模型。</li><li><strong>Measurement 專案</strong>：使用 C# 開發幾何測量系統，實作向量運算、矩陣轉換等線性代數概念，應用於幾何計算和測量。</li><li><strong>LightsOutGame 專案</strong>：使用 C# 實作點燈遊戲，運用線性代數來解決遊戲邏輯，理解如何用矩陣運算來處理遊戲狀態。</li><li><strong>RREF 專案</strong>：使用 C++ 實作簡化階梯形矩陣計算器，可以處理任意大小的矩陣並進行高斯消去法運算，實現線性方程組求解。</li></ul>這些專案涵蓋了矩陣運算和線性方程組求解、幾何計算和測量、整數線性規劃建模等核心概念，讓我理解到線性代數不只是抽象的數學概念，更是解決實際問題的重要工具。"
    },
    "1122_HDL": {
        "title": "1122 - 數位系統實驗（二）",
        "meta": "數位系統實驗（二） ｜ VHDL",
        "desc": "VHDL 數位電路設計（包含 ALU、狀態機、紅綠燈控制等 15 個實驗專案）。",
        "desc_html": "VHDL 數位電路設計：包含 ALU、狀態機、計數器、LED 控制、紅綠燈控制等 15 個實驗專案。",
        "longDesc": "這門課程透過 15 個實驗專案，讓我深入理解數位電路的設計與實作。專案涵蓋了從基礎到進階的各種數位電路：<ul><li><strong>Lab 04</strong>：使用 SOP/POS 方法實作布林函數，並實作八對三編碼器。</li><li><strong>Lab 05</strong>：設計基本組合邏輯電路與進階組合電路。</li><li><strong>Lab 06</strong>：實作 Moore machine 二進制編碼狀態機與序列偵測器 FSM。</li><li><strong>Lab 07</strong>：設計算數邏輯運算單元 (ALU)。</li><li><strong>Lab 08</strong>：實作移位暫存器與同步計數器。</li><li><strong>Lab 09</strong>：設計非同步清除同步載入的 60 模計數器。</li><li><strong>Lab 10-12</strong>：實作 LED 控制器、PWM 呼吸燈（自動調節 LED 亮度）、跑馬燈（LED 週期性位移電路）。</li><li><strong>Lab 13-14</strong>：設計七段顯示器計時器與 0-99 計數器。</li><li><strong>Lab 15</strong>：實作紅綠燈控制與倒數計時器。</li></ul>每個實驗都需要使用 VHDL 語言來描述電路行為，使用 Intel Quartus Prime 進行編譯，使用 ModelSim 執行 testbench 進行功能驗證，並在 FPGA 開發板上驗證功能。這個課程讓我對硬體描述語言、數位系統設計流程、狀態機設計、時序電路設計，以及硬體與軟體的差異有了深刻的理解。"
    },
    "1122_WebsiteProgrammingPractice": {
        "title": "1122 - 網站程式設計實務",
        "meta": "網站程式設計實務 ｜ Flask, JavaScript, Plotly.js",
        "desc": "網頁開發作業系列（LLM 聊天機器人、日圓匯率即時視覺化、RPG 小遊戲、亂數選擇器等）。",
        "desc_html": "網頁開發作業：LLM 聊天機器人、日圓匯率即時視覺化、RPG 小遊戲、亂數選擇器等。",
        "longDesc": "這門課程的作業涵蓋了多個 Web 開發的實務練習，包含 15 個專案，讓我對完整的前後端開發有了全面的理解：<ul><li><strong>基礎前端開發</strong>：HelloJavaScript（JavaScript 基礎測試）和 ClubCourse（JavaScript 自動排課系統）。</li><li><strong>資料視覺化專案</strong>：HelloPlotly（Plotly.js 基礎測試）、PieChart（圓餅圖製作）、LineAndScatter（折線圖與散點圖）、以及 JPYExchange（日圓匯率即時視覺化，使用 Plotly.js 繪製動態圖表並實作自動更新機制）。</li><li><strong>互動式應用</strong>：MindQuiz（JavaScript 心理測驗純前端版本）、MindQuiz_py（Python Flask 心理測驗後端版本）、RandomSelector（亂數選擇器）、以及 SimCardCalulator（SIM卡購買天數計算器）。</li><li><strong>遊戲開發</strong>：SimpleRPG（JavaScript RPG 小遊戲，練習物件導向程式設計與遊戲邏輯）和 SimpleRPG+LLM（結合 LLM 的 RPG 遊戲）。</li><li><strong>AI 應用</strong>：Chatbot（使用 Flask 整合 LLM API 開發聊天機器人，學習如何處理非同步請求與串流回應）、HelloLangChain（Google Gemini API 實作）、以及 LLMPhoto（LLM 圖片理解服務）。</li></ul>技術棧使用 HTML/CSS/JavaScript 處理前端，Python Flask 處理後端，整合 Plotly.js 進行資料視覺化，以及 Google Gemini API 和 LangChain 進行 AI 應用開發。每個專案都強調前後端的整合，讓我理解到現代 Web 開發的完整流程。"
    },
    "1122_AssemblyLanguage": {
        "title": "1122 - 組合語言與計算機組織",
        "meta": "組合語言與計算機組織 ｜ RISC-V Assembly",
        "desc": "RISC-V 組合語言實作（排列組合計算、五格姓名學分析、史坦納樹演算法）。",
        "desc_html": "RISC-V 組合語言專案：排列組合計算程式、五格姓名學分析程式、史坦納樹演算法實作。",
        "longDesc": "這門課程讓我深入理解底層計算機運作原理，透過 RISC-V 組合語言實作 3 個程式：<ul><li><strong>Combination & Permutation 專案</strong>：實作組合與排列數計算程式，包括計算 mPn（排列）、mCn（組合）、m^n（次方）、以及 mHn（重複組合），學習如何用組合語言實作階乘、排列、組合等數學運算，以及遞迴函數的組合語言實作。</li><li><strong>Nameology of the Five Elements 專案</strong>：實作五格姓名學分析程式，處理字串輸入並進行複雜的數值計算，包括輸入姓名筆劃數、計算三才五格數值等功能，練習了字串處理與迴圈控制。</li><li><strong>Steiner Trees 專案</strong>：實作史坦納樹演算法，學習如何用組合語言處理圖形演算法，包括計算圖形中的最小史坦納樹、支援座標點輸入與輸出等功能，理解了如何在低階語言中實作複雜的演算法。</li></ul>每個專案都需要仔細管理暫存器、記憶體位置，以及函數呼叫的堆疊操作，使用 RISC-V Assembly Language 編寫源碼（.asm 檔案）。開發過程中，我必須手動管理暫存器、理解指令管線化、以及處理記憶體存取。"
    },
    "1112_ComputerProgramming": {
        "title": "1112 - 程式設計二",
        "meta": "程式設計二 ｜ C++",
        "desc": "C++ 物件導向專案（Fibonacci、編碼機、Spanning Tree、撲克牌遊戲、多型計算）。",
        "desc_html": "C++ 物件導向：Fibonacci Sequence、編碼機、Graph 和 Spanning Tree、撲克牌遊戲、多型計算四邊形。",
        "longDesc": "這門課程專注於 C++ 物件導向程式設計，透過 5 個專案讓我扎實掌握 OOP 的核心概念：<ul><li><strong>BigFib 專案</strong>：實作大數運算的費波那契數列，練習遞迴與迭代的實作，以及大數運算的處理。</li><li><strong>CipherMachine 專案</strong>：實作字串處理與編碼機器，學習字元處理與檔案 I/O 操作。</li><li><strong>Graph 專案</strong>：實作圖形容器設計與路徑演算法，包括實作深度優先搜尋 (DFS) 與廣度優先搜尋 (BFS)，以及圖論與生成樹演算法。</li><li><strong>PokerDealer 專案</strong>：實作撲克牌發牌系統，練習類別設計與繼承，學習如何設計良好的物件導向架構。</li><li><strong>Quadrilaterals 專案</strong>：實作四邊形類別設計與點座標系統，深入理解虛擬函數、抽象類別與多型的概念，學習如何設計可擴展的類別層次結構。</li></ul>每個專案都強調良好的程式設計習慣，包括類別封裝、介面設計、以及程式碼重用。這些練習為我後續的軟體開發奠定了堅實的基礎。"
    },
    "1111_WebProgramming": {
        "title": "1111 - Web 程式設計",
        "meta": "Web 程式設計 ｜ HTML, PHP, JavaScript, Google Charts, MySQL",
        "desc": "網頁基礎開發作業（驗證碼系統、CSV/XML 資料處理、Google Charts 折線圖等）。",
        "desc_html": "網頁開發作業：驗證碼系統、資料處理（.csv/.xml）、Google Charts 折線圖、篩選查詢等。",
        "longDesc": "這是我第一門 Web 程式設計課程，透過多個作業讓我對基礎的 Web 開發技術有了完整的理解：<ul><li><strong>Captcha 專案</strong>：實作智能驗證碼系統，使用圖片分類驗證用戶身份，包含 IP 封鎖功能，學習如何產生圖形驗證碼並驗證使用者輸入，理解 Session 管理與安全性考量。</li><li><strong>LineChart 專案</strong>：使用 Google Charts API 製作互動式折線圖，支援 CSV 資料匯入和處理，學習如何將資料視覺化，以及如何處理不同格式的資料檔案。</li><li><strong>Querying 專案</strong>：實作多格式資料查詢系統，支援 CSV、XML 和 URL 資料來源的篩選 and 查詢，練習讀取與解析 CSV、XML 格式的檔案，並將資料存入資料庫，實作複雜的 SQL 查詢與前端篩選功能。</li></ul>技術棧包含 HTML 結構設計、CSS 樣式美化、JavaScript 互動處理、PHP 後端邏輯、以及 MySQL 資料庫操作。"
    }
}

# ---------------------------------------------------------
# 2. 本地開發與排版測試專用的 Mock 資料
# ---------------------------------------------------------
MOCK_DATA = [
    {
        "name": "Side Projects",
        "slug": "side-projects",
        "items": {
            "nodes": [
                {"name": "Currency_chart", "url": "https://github.com/tsz7250/Currency_chart", "description": None, "primaryLanguage": {"name": "Python"}},
                {"name": "yzuCourseBot", "url": "https://github.com/tsz7250/yzuCourseBot", "description": None, "primaryLanguage": {"name": "Python"}},
                {"name": "add-subtitles-extended", "url": "https://github.com/tsz7250/add-subtitles-extended", "description": None, "primaryLanguage": {"name": "JavaScript"}},
                {"name": "Coursio", "url": "https://github.com/tsz7250/Coursio", "description": None, "primaryLanguage": {"name": "JavaScript"}},
                {"name": "n8n-launcher", "url": "https://github.com/tsz7250/n8n-launcher", "description": None, "primaryLanguage": {"name": "Batchfile"}},
                {"name": "ezoe-work_scraper", "url": "https://github.com/tsz7250/ezoe-work_scraper", "description": None, "primaryLanguage": {"name": "Python"}},
                {"name": "bible-tracker", "url": "https://github.com/tsz7250/bible-tracker", "description": None, "primaryLanguage": {"name": "TypeScript"}}
            ]
        }
    },
    {
        "name": "Final Projects",
        "slug": "final-projects",
        "items": {
            "nodes": [
                {"name": "1131_Chatbot_Final", "url": "https://github.com/tsz7250/1131_Chatbot_Final", "description": None, "primaryLanguage": {"name": "Python"}},
                {"name": "1122_Web_Final", "url": "https://github.com/tsz7250/1122_Web_Final", "description": None, "primaryLanguage": {"name": "Python"}},
                {"name": "1111_WebProgramming_Final", "url": "https://github.com/tsz7250/1111_WebProgramming_Final", "description": None, "primaryLanguage": {"name": "PHP"}}
            ]
        }
    },
    {
        "name": "Courseworks",
        "slug": "courseworks",
        "items": {
            "nodes": [
                {"name": "1131_Chatbot", "url": "https://github.com/tsz7250/1131_Chatbot", "description": None, "primaryLanguage": {"name": "Python"}},
                {"name": "1121_LinearAlgebra", "url": "https://github.com/tsz7250/1121_LinearAlgebra", "description": None, "primaryLanguage": {"name": "C#"}},
                {"name": "1122_HDL", "url": "https://github.com/tsz7250/1122_HDL", "description": None, "primaryLanguage": {"name": "VHDL"}},
                {"name": "1122_WebsiteProgrammingPractice", "url": "https://github.com/tsz7250/1122_WebsiteProgrammingPractice", "description": None, "primaryLanguage": {"name": "HTML"}},
                {"name": "1122_AssemblyLanguage", "url": "https://github.com/tsz7250/1122_AssemblyLanguage", "description": None, "primaryLanguage": {"name": "Assembly"}},
                {"name": "1112_ComputerProgramming", "url": "https://github.com/tsz7250/1112_ComputerProgramming", "description": None, "primaryLanguage": {"name": "C++"}},
                {"name": "1111_WebProgramming", "url": "https://github.com/tsz7250/1111_WebProgramming", "description": None, "primaryLanguage": {"name": "PHP"}}
            ]
        }
    }
]

# ---------------------------------------------------------
# 3. 核心抓取邏輯 (GitHub GraphQL API)
# ---------------------------------------------------------
def fetch_github_lists(username, token):
    query = """
    {
      user(login: "%s") {
        lists(first: 100) {
          nodes {
            name
            description
            slug
            updatedAt
            items(first: 100) {
              nodes {
                ... on Repository {
                  name
                  url
                  description
                  updatedAt
                  stargazerCount
                  primaryLanguage {
                    name
                  }
                }
              }
            }
          }
        }
      }
    }
    """ % username

    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post("https://api.github.com/graphql", json={'query': query}, headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        if 'errors' in data:
            raise Exception(f"GraphQL API 錯誤: {data['errors']}")
        return data['data']['user']['lists']['nodes']
    else:
        raise Exception(f"API 請求失敗，狀態碼: {response.status_code}, 內容: {response.text}")

# ---------------------------------------------------------
# 4. Markdown 表格產生器 (README.md)
# ---------------------------------------------------------
def generate_readme_content(category_id, items):
    if category_id == "personal":
        md = "| 專案名稱 | 技術棧 | 專案簡介 |\n| :--- | :--- | :--- |\n"
        for item in items:
            name = item["name"]
            url = item["url"]
            override = METADATA_OVERRIDES.get(name, {})
            title = override.get("title", name)
            meta = override.get("meta", item.get("primaryLanguage", {}).get("name") if item.get("primaryLanguage") else "GitHub Project")
            desc = override.get("desc", item.get("description") or "")
            md += f"| **[{title}]({url})** | {meta} | {desc} |\n"
        return md
    elif category_id == "final":
        md = "| 專案名稱 | 課程名稱 & 技術棧 | 專案簡介 |\n| :--- | :--- | :--- |\n"
        for item in items:
            name = item["name"]
            url = item["url"]
            override = METADATA_OVERRIDES.get(name, {})
            title = override.get("title", name)
            meta = override.get("meta", item.get("primaryLanguage", {}).get("name") if item.get("primaryLanguage") else "GitHub Project")
            desc = override.get("desc", item.get("description") or "")
            md += f"| **[{title}]({url})** | {meta} | {desc} |\n"
        return md
    elif category_id == "homework":
        md = ""
        for item in items:
            name = item["name"]
            url = item["url"]
            override = METADATA_OVERRIDES.get(name, {})
            title = override.get("title", name)
            desc = override.get("desc", item.get("description") or "")
            md += f"* **[{title}]({url})**：{desc}\n"
        return md
    return ""

# ---------------------------------------------------------
# 5. HTML 卡片產生器 (index.html)
# ---------------------------------------------------------
def generate_html_content(category_id, items, base_dir=""):
    html = ""
    for idx, item in enumerate(items, 1):
        name = item["name"]
        url = item["url"]
        override = METADATA_OVERRIDES.get(name, {})
        title = override.get("title", name)
        
        meta = override.get("meta_html", override.get("meta", item.get("primaryLanguage", {}).get("name") if item.get("primaryLanguage") else "GitHub Project"))
        desc = override.get("desc_html", override.get("desc", item.get("description") or ""))
        
        # 偵測本地圖片是否存在，無則 fallback 向量占位圖 default.svg
        img_local_path = os.path.join(base_dir, "assets", "img", "portfolio", f"{name}.png")
        if os.path.exists(img_local_path):
            img_src = f"./assets/img/portfolio/{name}.png"
        else:
            img_src = "./assets/img/portfolio/default.svg"
        
        html += f"""          <!-- Card {idx}: {name} -->
          <article class="project-card" data-project-id="{name}">
            <img class="project-card__image" src="{img_src}" alt="{name}" />
            <div class="project-card__content">
              <h3 class="project-card__title">{title}</h3>
              <p class="project-card__desc">{desc}</p>
              <p class="project-card__meta">{meta}</p>
              <a href="{url}" class="project-card__btn">GitHub →</a>
            </div>
          </article>\n"""
    return html

# ---------------------------------------------------------
# 6. JavaScript Projects 陣列產生器 (main.js)
# ---------------------------------------------------------
def generate_js_projects_content(all_items, base_dir=""):
    js = "  const projects = [\n"
    for idx, item in enumerate(all_items):
        name = item["name"]
        url = item["url"]
        override = METADATA_OVERRIDES.get(name, {})
        title = override.get("title", name)
        
        # 偵測本地圖片是否存在
        img_local_path = os.path.join(base_dir, "assets", "img", "portfolio", f"{name}.png")
        if os.path.exists(img_local_path):
            img_src = f"./assets/img/portfolio/{name}.png"
        else:
            img_src = "./assets/img/portfolio/default.svg"
            
        # 詳細長描述處理
        long_desc = override.get("longDesc")
        if not long_desc:
            desc_text = override.get("desc", item.get("description") or "此專案為開發展示，詳細內容可前往其 GitHub Repository 進行深入閱讀與暸解。")
            long_desc = f"{desc_text}<br><br>想要深入暸解更多，請點擊下方按鈕前往 GitHub 倉庫參閱程式碼與專案細節。"
            
        # JS 安全轉義字元
        long_desc_js = long_desc.replace("'", "\\'").replace("\n", "\\n").replace("\r", "")
        title_js = title.replace("'", "\\'")
        
        meta = override.get("meta_html", override.get("meta", item.get("primaryLanguage", {}).get("name") if item.get("primaryLanguage") else "GitHub Project"))
        meta_js = meta.replace("'", "\\'")
        
        js += f"""    {{
      id: '{name}',
      title: '{title_js}',
      longDesc: '{long_desc_js}',
      tech: '{meta_js}',
      image: '{img_src}',
      github: '{url}'
    }}"""
        if idx < len(all_items) - 1:
            js += ",\n"
        else:
            js += "\n"
    js += "  ];"
    return js

# ---------------------------------------------------------
# 7. 檔案區塊置換邏輯
# ---------------------------------------------------------
def update_file_between_markers(file_path, start_marker, end_marker, new_content):
    if not os.path.exists(file_path):
        print(f"[警告] 找不到檔案: {file_path}")
        return False
        
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    start_idx = content.find(start_marker)
    end_idx = content.find(end_marker)
    
    if start_idx == -1 or end_idx == -1:
        print(f"[警告] 在 {file_path} 中找不到標記 {start_marker} 或 {end_marker}")
        return False
        
    # 置換中間區塊，並保留標籤
    new_file_content = (
        content[:start_idx + len(start_marker)] +
        "\n" + new_content.rstrip() + "\n" +
        content[end_idx:]
    )
    
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(new_file_content)
    print(f"[成功] 已更新 {file_path} 中的動態區塊")
    return True

# ---------------------------------------------------------
# 8. 主程式執行
# ---------------------------------------------------------
def main():
    username = "tsz7250"
    token = os.environ.get("GH_TOKEN") or os.environ.get("GITHUB_TOKEN")
    
    # 決定資料來源：API 抓取或本地 Mock 資料
    if token:
        print("[資訊] 偵測到 GitHub Token，開始從 API 取得動態 List 資料...")
        try:
            lists = fetch_github_lists(username, token)
        except Exception as e:
            print(f"[錯誤] 無法從 GitHub API 抓取資料: {e}")
            print("[資訊] 將自動切換至 Mock 測試模式...")
            lists = MOCK_DATA
    else:
        print("[資訊] 未偵測到 GH_TOKEN。啟用本地 MOCK 模式，載入預設專案資料以供格式測試。")
        lists = MOCK_DATA

    # 分類映射配置
    categories = {
        "personal": {"slug_kw": ["side", "personal"], "readme_tag": ("<!-- START_PERSONAL_PROJECTS -->", "<!-- END_PERSONAL_PROJECTS -->"), "html_tag": ("<!-- START_PERSONAL_PROJECTS -->", "<!-- END_PERSONAL_PROJECTS -->"), "items": []},
        "final": {"slug_kw": ["final"], "readme_tag": ("<!-- START_FINAL_PROJECTS -->", "<!-- END_FINAL_PROJECTS -->"), "html_tag": ("<!-- START_FINAL_PROJECTS -->", "<!-- END_FINAL_PROJECTS -->"), "items": []},
        "homework": {"slug_kw": ["course", "homework", "academic"], "readme_tag": ("<!-- START_HOMEWORK_PROJECTS -->", "<!-- END_HOMEWORK_PROJECTS -->"), "html_tag": ("<!-- START_HOMEWORK_PROJECTS -->", "<!-- END_HOMEWORK_PROJECTS -->"), "items": []}
    }

    # 將抓取回來的 lists 進行分類歸檔
    for node in lists:
        slug = node.get("slug", "").lower()
        items = node.get("items", {}).get("nodes", [])
        
        matched = False
        for cat_id, cfg in categories.items():
            if any(kw in slug for kw in cfg["slug_kw"]):
                cfg["items"] = items
                matched = True
                print(f"[分類] GitHub List '{node['name']}' 已成功歸類至 {cat_id}")
                break
        if not matched:
            print(f"[略過] GitHub List '{node['name']}' (slug: {slug}) 不符合篩選條件，已跳過。")

    # 偵測運行的根目錄路徑
    base_dir = ""
    readme_path = "README.md"
    html_path = "index.html"
    js_path = "assets/js/main.js"

    # 若於 Action 環境，工作目錄可能需做定位
    if not os.path.exists(readme_path) and os.path.exists("../README.md"):
        base_dir = ".."
        readme_path = "../README.md"
        html_path = "../index.html"
        js_path = "../assets/js/main.js"

    # 收集所有的專案，用於更新 JS 陣列
    all_projects = []

    # 執行檔案同步
    for cat_id, cfg in categories.items():
        if not cfg["items"]:
            # 如果沒有對應的 list 資料，就保持原本的 override 靜態對應
            print(f"[警告] 沒有找到歸屬 {cat_id} 的 GitHub List 資料，將使用 METADATA_OVERRIDES 進行 Mock 還原...")
            mock_items = []
            for name, data in METADATA_OVERRIDES.items():
                is_personal = cat_id == "personal" and name in ["Currency_chart", "yzuCourseBot", "add-subtitles-extended", "Coursio", "n8n-launcher", "ezoe-work_scraper", "bible-tracker"]
                is_final = cat_id == "final" and name in ["1131_Chatbot_Final", "1122_Web_Final", "1111_WebProgramming_Final"]
                is_homework = cat_id == "homework" and name in ["1131_Chatbot", "1121_LinearAlgebra", "1122_HDL", "1122_WebsiteProgrammingPractice", "1122_AssemblyLanguage", "1112_ComputerProgramming", "1111_WebProgramming"]
                if is_personal or is_final or is_homework:
                    mock_items.append({
                        "name": name,
                        "url": f"https://github.com/tsz7250/{name}",
                        "description": None,
                        "primaryLanguage": None
                    })
            cfg["items"] = mock_items

        all_projects.extend(cfg["items"])

        # 產生並更新 README.md
        readme_content = generate_readme_content(cat_id, cfg["items"])
        update_file_between_markers(readme_path, cfg["readme_tag"][0], cfg["readme_tag"][1], readme_content)

        # 產生並更新 index.html
        html_content = generate_html_content(cat_id, cfg["items"], base_dir)
        update_file_between_markers(html_path, cfg["html_tag"][0], cfg["html_tag"][1], html_content)

    # 產生並更新 assets/js/main.js 中的 projects 陣列
    js_projects_content = generate_js_projects_content(all_projects, base_dir)
    update_file_between_markers(js_path, "// START_PROJECTS_DATA", "// END_PROJECTS_DATA", js_projects_content)

if __name__ == "__main__":
    main()
