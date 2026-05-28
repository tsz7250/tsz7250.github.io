document.addEventListener('DOMContentLoaded', () => {
  // ============================================
  // Tabs Navigation
  // ============================================
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  // Peek Carousel instances need to be accessible inside tab switch handler
  const carousels = {};

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;

      // Update active button
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update active panel
      tabPanels.forEach(panel => {
        panel.classList.remove('active');
        if (panel.id === `panel-${targetTab}`) {
          panel.classList.add('active');
          // Reset carousel position when switching tabs
          const carousel = panel.querySelector('.peek-carousel');
          if (carousel) {
            const carouselName = carousel.dataset.carousel;
            if (carousels[carouselName]) {
              carousels[carouselName].goTo(0);
            }
          }
        }
      });
    });
  });

  // ============================================
  // Peek Carousel
  // ============================================
  class PeekCarousel {
    constructor(container, name) {
      this.container = container;
      this.name = name;
      this.cards = container.querySelectorAll('.project-card');
      this.totalCards = this.cards.length;
      this.currentIndex = 0;
      this.cardsToShow = this.getCardsToShow();
      
      this.prevBtn = document.querySelector(`.carousel-prev[data-carousel="${name}"]`);
      this.nextBtn = document.querySelector(`.carousel-next[data-carousel="${name}"]`);
      this.dotsContainer = document.querySelector(`.carousel-dots[data-carousel="${name}"]`);
      
      this.init();
    }

    getCardsToShow() {
      if (window.innerWidth <= 600) return 1;
      if (window.innerWidth <= 900) return 1.5;
      return 2;
    }

    getTotalPages() {
      return Math.ceil(this.totalCards / Math.floor(this.getCardsToShow()));
    }

    init() {
      this.createDots();
      this.bindEvents();
      this.update();
    }

    createDots() {
      if (!this.dotsContainer) return;
      
      this.dotsContainer.innerHTML = '';
      const totalPages = this.getTotalPages();
      
      for (let i = 0; i < totalPages; i++) {
        const dot = document.createElement('button');
        dot.classList.add('carousel-dot');
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.addEventListener('click', () => this.goTo(i * Math.floor(this.getCardsToShow())));
        this.dotsContainer.appendChild(dot);
      }
    }

    bindEvents() {
      if (this.prevBtn) {
        this.prevBtn.addEventListener('click', () => this.prev());
      }
      if (this.nextBtn) {
        this.nextBtn.addEventListener('click', () => this.next());
      }

      // Recalculate on resize
      let resizeTimeout;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          this.cardsToShow = this.getCardsToShow();
          this.createDots();
          this.update();
        }, 150);
      });

      // Touch support
      let touchStartX = 0;
      let touchEndX = 0;

      this.container.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      this.container.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        this.handleSwipe(touchStartX, touchEndX);
      }, { passive: true });
    }

    handleSwipe(startX, endX) {
      const diff = startX - endX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          this.next();
        } else {
          this.prev();
        }
      }
    }

    prev() {
      const step = Math.floor(this.getCardsToShow());
      if (this.currentIndex > 0) {
        this.currentIndex = Math.max(0, this.currentIndex - step);
        this.update();
      }
    }

    next() {
      const step = Math.floor(this.getCardsToShow());
      const maxIndex = this.totalCards - Math.floor(this.cardsToShow);
      if (this.currentIndex < maxIndex) {
        this.currentIndex = Math.min(maxIndex, this.currentIndex + step);
        this.update();
      }
    }

    goTo(index) {
      const maxIndex = this.totalCards - Math.floor(this.cardsToShow);
      this.currentIndex = Math.max(0, Math.min(maxIndex, index));
      this.update();
    }

    update() {
      // Calculate card width including gap
      const card = this.cards[0];
      if (!card) return;
      
      const cardWidth = card.offsetWidth;
      const gap = 24; // Match CSS gap
      
      const translateX = -this.currentIndex * (cardWidth + gap);
      this.container.style.transform = `translateX(${translateX}px)`;

      // Update dots
      if (this.dotsContainer) {
        const dots = this.dotsContainer.querySelectorAll('.carousel-dot');
        const step = Math.floor(this.getCardsToShow());
        const currentPage = Math.floor(this.currentIndex / step);
        
        dots.forEach((dot, i) => {
          dot.classList.toggle('active', i === currentPage);
        });
      }

      // Update button states
      const maxIndex = this.totalCards - Math.floor(this.cardsToShow);
      if (this.prevBtn) {
        this.prevBtn.disabled = this.currentIndex === 0;
      }
      if (this.nextBtn) {
        this.nextBtn.disabled = this.currentIndex >= maxIndex;
      }
    }
  }

  // Initialize all carousels
  document.querySelectorAll('.peek-carousel').forEach(carousel => {
    const name = carousel.dataset.carousel;
    carousels[name] = new PeekCarousel(carousel, name);
  });

  // ============================================
  // Project Detail Modal Data
  // ============================================
  // START_PROJECTS_DATA
  const projects = [
    {
      id: 'Currency_chart',
      title: 'Currency_chart',
      longDesc: '這是一個功能完整的匯率追蹤應用程式，使用 Python Flask 框架開發。系統使用 Playwright 和 Chromium 自動化瀏覽器來從 Mastercard 公開服務獲取匯率資料，並在背景自動更新。核心功能包括多時間區間圖表顯示（近 7/30/90/180 天）、幣別搜尋與快速交換介面、歷史記錄查看功能等。首次啟動時會自動檢查並更新匯率數據，如需獲取 Cookies 會自動顯示瀏覽器窗口約 10 秒，整個過程完全自動化。',
      tech: 'Python Flask, Chart.js',
      image: './assets/img/portfolio/Currency_chart.png',
      github: 'https://github.com/tsz7250/Currency_chart'
    },
    {
      id: 'add-subtitles-extended',
      title: 'add-subtitles-extended',
      longDesc: '這是一個 Firefox 瀏覽器擴充套件，基於原始 add-subtitles 進行修復及優化。主要功能是為網頁上的任何 video 元素新增外部字幕檔案。我新增了多項功能：<ul><li>支援 ASS/SSA 字幕格式（原本只支援 SRT、VTT）。</li><li>使用 OpenCC-JS 實現自動簡體中文轉繁體中文。</li><li>支援 ZIP 壓縮檔中的字幕（使用 JSZip 函式庫）。</li><li>修復全螢幕播放功能。</li><li>改善外觀設計。</li></ul>同時，我重構了內容腳本注入邏輯，增加錯誤處理與狀態檢查，優化 OpenCC 加載流程，修復了字幕上傳功能。使用者可以調整字幕位置、大小和顏色，並使用鍵盤快捷鍵控制。',
      tech: 'JavaScript (Web Ext)',
      image: './assets/img/portfolio/add-subtitles-extended.png',
      github: 'https://github.com/tsz7250/add-subtitles-extended'
    },
    {
      id: 'yzuCourseBot',
      title: 'yzuCourseBot',
      longDesc: '這是一個針對元智大學選課系統開發的自動化工具，基於原始 yzuCourseBot 進行 fork 並針對 Windows 環境進行深度優化。主要改進包括：<ul><li>更新套件相容性以支援 Python 3.12。</li><li>修正 Windows 平台的依賴問題。</li><li>提供完整的 Windows 安裝指南。</li><li>優化執行穩定性。</li><li>新增可執行檔降低使用門檻。</li></ul>專案提供兩種執行方式：使用 Flet 框架開發的 GUI 圖形介面版本，以及傳統的命令列版本。驗證碼識別使用 CNN 模型進行 OCR 識別。我還使用 PyInstaller 將程式打包成 .exe 執行檔，並建立了自動化建置流程。這個專案幫助許多同學在選課期間節省了大量時間。',
      tech: 'Python',
      image: './assets/img/portfolio/yzuCourseBot.png',
      github: 'https://github.com/tsz7250/yzuCourseBot'
    },
    {
      id: 'n8n-launcher',
      title: 'n8n-launcher',
      longDesc: '這是一個專為 Windows 系統設計的 n8n Docker 容器管理工具，提供簡單易用的圖形化選單介面來管理 n8n 工作流程自動化平台。主要功能包括：<ul><li><strong>一鍵啟動</strong>：自動檢查並啟動 Docker，無需手動配置。</li><li><strong>自動配置</strong>：首次使用時自動建立 docker-compose.yml 配置檔。</li><li><strong>資料備份</strong>：一鍵備份 n8n 工作流程和 PostgreSQL 資料庫。</li><li><strong>資料還原</strong>：輕鬆還原先前備份的資料。</li><li><strong>重新安裝</strong>：快速重新安裝並可選擇保留資料。</li></ul>工具使用 Batch 腳本開發，整合 Docker Compose 來管理容器生命週期。腳本會自動檢查 Docker Desktop 運行狀態，提供友好的錯誤提示，並在服務就緒後自動開啟瀏覽器。',
      tech: 'Batchfile, Docker',
      image: './assets/img/portfolio/n8n-launcher.png',
      github: 'https://github.com/tsz7250/n8n-launcher'
    },
    {
      id: 'ezoe-work_scraper',
      title: 'ezoe-work_scraper',
      longDesc: '這是一個針對 ezoe.work 網站的文章爬蟲工具，可以批次抓取文章並輸出為格式化的 DOCX 與 PDF 檔案。主要功能包括：<ul><li><strong>批次爬取</strong>：從 urls.txt 或指定 txt 檔案讀取 URL，每篇產生獨立的 Markdown 檔案（書名_篇數.md）。</li><li><strong>合併轉換</strong>：依書名自動合併多篇 Markdown，轉成一本完整的 DOCX 檔案，可設定行距、標題樣式等格式。</li><li><strong>簡轉繁與 PDF</strong>：程式會將 DOCX 以 Microsoft Word 進行簡體轉繁體，並轉成 PDF 檔案。需在 Windows 環境且已安裝 Microsoft Word，否則會略過此步驟。</li><li><strong>一鍵流程</strong>：執行 main.py 可依序完成「爬取 → 轉 DOCX/PDF」的完整流程。</li></ul>技術上使用 Python 開發，整合 BeautifulSoup 進行網頁解析、pypandoc 進行 Markdown 轉 DOCX、pywin32 進行 Word 自動化操作（簡轉繁與 PDF 轉換）。',
      tech: 'Python, Scrapy',
      image: './assets/img/portfolio/ezoe-work_scraper.png',
      github: 'https://github.com/tsz7250/ezoe-work_scraper'
    },
    {
      id: 'Coursio',
      title: 'Coursio',
      longDesc: '本專案參考 Wanna Class 進行架構重構與功能擴充，打造一個現代化的元智大學選課助手。技術架構由原始的 Vanilla JS + jQuery 升級為 Vue 3 + Vite + SCSS，並使用 Electron 封裝為桌面應用程式。主要功能包括：<ul><li><strong>我的課表</strong>：直觀記錄歷年課程，支援匯出功能。</li><li><strong>課程查詢</strong>：快速檢索全校課表，顯示學分、教室及教授等詳細資訊。</li><li><strong>自動選課</strong>：模擬使用者行為進行全自動化搶課，大幅提升成功率。</li><li><strong>成績查詢</strong>：快速檢閱各學期成績紀錄。</li><li><strong>系統設定</strong>：彈性調整重試頻率與登入偏好。</li></ul>專案強調安全性與效能，承諾不紀錄帳號密碼，並優化資源消耗。透過 SQLite3 管理資料並整合 Puppeteer 處理網頁自動化，有效解決了官網操作繁瑣與驗證碼搜尋的痛點。',
      tech: 'Electron',
      image: './assets/img/portfolio/Coursio.png',
      github: 'https://github.com/tsz7250/Coursio'
    },
    {
      id: 'bible-tracker',
      title: 'bible-tracker',
      longDesc: '這是一個以 LINE Bot + Google Apps Script (GAS) 打造的聖經與生命讀經進度追蹤應用。系統幫助小組成員記錄每日讀經、自動同步一年讀經計畫與對應的生命讀經篇目，並即時統計群組排名。主要功能包括：<ul><li><strong>多元記錄模式</strong>：支援自由讀經、一年計畫與生命讀經的獨立勾選與智慧同步。</li><li><strong>進度儀表板</strong>：即時視覺化舊約、新約及生命讀經的完成百分比。</li><li><strong>群組互動</strong>：透過 LINE Bot 取得專屬連結，並查看成員間的閱讀比例與即時排名。</li><li><strong>安全與優化</strong>：實作 SHA-256 加密的 PIN 碼驗證，並提供批次儲存邏輯以提升使用者體驗。</li></ul>專案整合了 LINE Messaging API 與 Google Sheets，展現了如何利用雲端工具解決社群協作與個人進度管理的需求。',
      tech: 'LINE Bot, Google Apps Script',
      image: './assets/img/portfolio/bible-tracker.png',
      github: 'https://github.com/tsz7250/bible-tracker'
    },
    {
      id: '1131_Chatbot_Final',
      title: '電影AI助手聊天機器人',
      longDesc: '這是一個期末分組報告專案，我們開發了一個功能豐富的多模態 AI 聊天機器人，專門提供電影相關服務。系統提供四大聊天模式：<ul><li><strong>聊天模式 (GEMINI)</strong>：與 Google Gemini AI 進行自然語言對話。</li><li><strong>電影查詢 (SEARCH_MOVIE)</strong>：搜尋 TMDB 電影資料庫獲取詳細資訊。</li><li><strong>以圖搜片 (GUESS_MOVIE)</strong>：上傳電影劇照或海報讓 AI 自動識別。</li><li><strong>字幕翻譯 (SUB_TRANSLATE)</strong>：自動生成影片字幕並翻譯成多國語言。</li></ul>技術架構使用 Flask 作為後端框架，整合 Google Gemini、LINE Bot SDK、Microsoft Azure (翻譯、語音、語言分析)、TMDB API，並使用 FFmpeg 處理多媒體檔案。系統支援 LINE Bot 和網頁版雙重介面，能夠處理圖片、音訊、影片等多媒體檔案，實現即時字幕生成與嵌入。專案採用模組化架構設計，將各功能封裝成獨立模組，便於維護與擴展。',
      tech: '微型應用程式設計實務 ｜ Line Bot, Gemini, TMDB API',
      image: './assets/img/portfolio/1131_Chatbot_Final.png',
      github: 'https://github.com/tsz7250/1131_Chatbot_Final'
    },
    {
      id: '1122_Web_Final',
      title: '卡利西里餐廳訂餐系統',
      longDesc: '這是一個完整的餐廳訂餐模擬系統，使用 Python Flask 作為後端框架開發的期末分組報告專案。系統提供完整的點餐功能：<ul><li><strong>直接點餐</strong>：瀏覽完整菜單並選擇餐點。</li><li><strong>隨機點餐系統</strong>：智能推薦功能。</li><li><strong>購物車管理</strong>：即時管理訂單內容和總價計算。</li><li><strong>智能聊天機器人</strong>：整合 Google Gemini AI 與 LangChain 框架，可以回答用戶關於餐點的問題並提供個性化推薦。</li><li><strong>數據分析</strong>：使用 Pandas 處理銷售數據，並使用 PlotlyJS 繪製互動式圖表，實現多維度分析（按餐點類型、時間等維度）。</li><li><strong>營業管理模擬</strong>：包括公休時間設定、即時營業狀態更新、營業時間智能提醒。</li></ul>前端使用 HTML5 Canvas 實現創新的視覺效果，並採用響應式設計支援桌面和行動裝置。數據儲存使用 JSON 格式儲存菜單和配置數據，CSV 格式儲存銷售數據。',
      tech: '網站程式設計實務 ｜ Flask, PlotlyJS, Gemini',
      image: './assets/img/portfolio/1122_Web_Final.png',
      github: 'https://github.com/tsz7250/1122_Web_Final'
    },
    {
      id: '1111_WebProgramming_Final',
      title: '隨機選擇器與記帳系統',
      longDesc: '這是一個校園美食隨機選擇器系統，作為 Web 程式設計課程的期末專題報告。系統提供以下功能：<ul><li><strong>隨機選擇功能</strong>：支援食物類別和餐廳類型的多層級篩選，智能推薦演算法幫助學生快速決定要吃什麼。</li><li><strong>用戶管理系統</strong>：包括用戶註冊、登入驗證、會話管理（使用 PHP Session），並實現了密碼加密與 SQL 注入防護等安全性措施。</li><li><strong>記帳系統</strong>：讓使用者可以記錄每次消費金額，支援依食物類別統計支出、依日期範圍查詢記錄、計算總消費金額等功能。</li><li><strong>歷史功能</strong>：可以查看過去的選擇記錄和消費明細，並提供視覺化消費趨勢圖表。</li></ul>技術架構使用 HTML/CSS/JavaScript 處理前端，PHP 處理後端邏輯，MySQL 資料庫儲存資料，採用正規化的資料表結構設計。系統採用響應式設計，支援手機和電腦使用。',
      tech: 'Web 程式設計 ｜ HTML, CSS, JS, PHP, MySQL',
      image: './assets/img/portfolio/1111_WebProgramming_Final.png',
      github: 'https://github.com/tsz7250/1111_WebProgramming_Final'
    },
    {
      id: '1131_Chatbot',
      title: '1131 - 微型應用程式設計實務',
      longDesc: '這門課程的作業整合了 9 個 AI 聊天機器人和微型應用程式專案，讓我對不同 AI 服務的整合有了深入理解。專案包含：<ul><li><strong>LLM_Chatbot</strong>：使用 Google Gemini API 建立的網頁版聊天機器人，具備安全設定 and 對話功能。</li><li><strong>LLM_Line</strong>：整合 Gemini API 的 Line Bot，提供智能對話服務。</li><li><strong>LangChain</strong>：基於 LangChain 框架開發的 AI 應用程式。</li><li><strong>SentimentAnalysis</strong>：使用 Microsoft Language Service 進行情感分析，判斷文字的正向、負向或中性情緒。</li><li><strong>TextToSpeech</strong>：整合 Azure Translation 和 Speech Services 的 Line Bot，提供文字翻譯和語音合成功能。</li><li><strong>TranslatorBot</strong>：使用 Azure Translation Service 的多語言翻譯服務。</li><li><strong>TranslatorBot(+voice)</strong>：進階版翻譯機器人，支援語音輸入和語音輸出。</li><li><strong>TranslatorWeb</strong>：基於 Flask 的網頁翻譯應用程式，整合 Azure 翻譯和語音服務。</li><li><strong>GeminiSafetySetting</strong>：展示 Google Gemini API 的安全設定範例。</li></ul>技術棧使用 Python 開發，整合 Flask 框架、Google Gemini API、Microsoft Azure Cognitive Services、LangChain，以及 Line Messaging API。',
      tech: '微型應用程式設計實務 ｜ Line Bot, Flask, Gemini, Azure, LangChain',
      image: './assets/img/portfolio/1131_Chatbot.png',
      github: 'https://github.com/tsz7250/1131_Chatbot'
    },
    {
      id: '1121_LinearAlgebra',
      title: '1121 - 線性代數',
      longDesc: '這門課程的作業展示了線性代數在實際程式設計中的應用，包含 4 個專案：<ul><li><strong>ILP 專案</strong>：使用 C++ 生成整數線性規劃問題，並使用 LINGO 軟體解決圖形二分割問題，學習如何將實際問題轉化為數學模型。</li><li><strong>Measurement 專案</strong>：使用 C# 開發幾何測量系統，實作向量運算、矩陣轉換等線性代數概念，應用於幾何計算和測量。</li><li><strong>LightsOutGame 專案</strong>：使用 C# 實作點燈遊戲，運用線性代數來解決遊戲邏輯，理解如何用矩陣運算來處理遊戲狀態。</li><li><strong>RREF 專案</strong>：使用 C++ 實作簡化階梯形矩陣計算器，可以處理任意大小的矩陣並進行高斯消去法運算，實現線性方程組求解。</li></ul>這些專案涵蓋了矩陣運算和線性方程組求解、幾何計算和測量、整數線性規劃建模等核心概念，讓我理解到線性代數不只是抽象的數學概念，更是解決實際問題的重要工具。',
      tech: '線性代數 ｜ C#, C++, LINGO',
      image: './assets/img/portfolio/1121_LinearAlgebra.png',
      github: 'https://github.com/tsz7250/1121_LinearAlgebra'
    },
    {
      id: '1122_HDL',
      title: '1122 - 數位系統實驗（二）',
      longDesc: '這門課程透過 15 個實驗專案，讓我深入理解數位電路的設計與實作。專案涵蓋了從基礎到進階的各種數位電路：<ul><li><strong>Lab 04</strong>：使用 SOP/POS 方法實作布林函數，並實作八對三編碼器。</li><li><strong>Lab 05</strong>：設計基本組合邏輯電路與進階組合電路。</li><li><strong>Lab 06</strong>：實作 Moore machine 二進制編碼狀態機與序列偵測器 FSM。</li><li><strong>Lab 07</strong>：設計算數邏輯運算單元 (ALU)。</li><li><strong>Lab 08</strong>：實作移位暫存器與同步計數器。</li><li><strong>Lab 09</strong>：設計非同步清除同步載入的 60 模計數器。</li><li><strong>Lab 10-12</strong>：實作 LED 控制器、PWM 呼吸燈（自動調節 LED 亮度）、跑馬燈（LED 週期性位移電路）。</li><li><strong>Lab 13-14</strong>：設計七段顯示器計時器與 0-99 計數器。</li><li><strong>Lab 15</strong>：實作紅綠燈控制與倒數計時器。</li></ul>每個實驗都需要使用 VHDL 語言來描述電路行為，使用 Intel Quartus Prime 進行編譯，使用 ModelSim 執行 testbench 進行功能驗證，並在 FPGA 開發板上驗證功能。這個課程讓我對硬體描述語言、數位系統設計流程、狀態機設計、時序電路設計，以及硬體與軟體的差異有了深刻的理解。',
      tech: '數位系統實驗（二） ｜ VHDL',
      image: './assets/img/portfolio/1122_HDL.png',
      github: 'https://github.com/tsz7250/1122_HDL'
    },
    {
      id: '1122_WebsiteProgrammingPractice',
      title: '1122 - 網站程式設計實務',
      longDesc: '這門課程的作業涵蓋了多個 Web 開發的實務練習，包含 15 個專案，讓我對完整的前後端開發有了全面的理解：<ul><li><strong>基礎前端開發</strong>：HelloJavaScript（JavaScript 基礎測試）和 ClubCourse（JavaScript 自動排課系統）。</li><li><strong>資料視覺化專案</strong>：HelloPlotly（Plotly.js 基礎測試）、PieChart（圓餅圖製作）、LineAndScatter（折線圖與散點圖）、以及 JPYExchange（日圓匯率即時視覺化，使用 Plotly.js 繪製動態圖表並實作自動更新機制）。</li><li><strong>互動式應用</strong>：MindQuiz（JavaScript 心理測驗純前端版本）、MindQuiz_py（Python Flask 心理測驗後端版本）、RandomSelector（亂數選擇器）、以及 SimCardCalulator（SIM卡購買天數計算器）。</li><li><strong>遊戲開發</strong>：SimpleRPG（JavaScript RPG 小遊戲，練習物件導向程式設計與遊戲邏輯）和 SimpleRPG+LLM（結合 LLM 的 RPG 遊戲）。</li><li><strong>AI 應用</strong>：Chatbot（使用 Flask 整合 LLM API 開發聊天機器人，學習如何處理非同步請求與串流回應）、HelloLangChain（Google Gemini API 實作）、以及 LLMPhoto（LLM 圖片理解服務）。</li></ul>技術棧使用 HTML/CSS/JavaScript 處理前端，Python Flask 處理後端，整合 Plotly.js 進行資料視覺化，以及 Google Gemini API 和 LangChain 進行 AI 應用開發。每個專案都強調前後端的整合，讓我理解到現代 Web 開發的完整流程。',
      tech: '網站程式設計實務 ｜ Flask, JavaScript, Plotly.js',
      image: './assets/img/portfolio/1122_WebsiteProgrammingPractice.png',
      github: 'https://github.com/tsz7250/1122_WebsiteProgrammingPractice'
    },
    {
      id: '1122_AssemblyLanguage',
      title: '1122 - 組合語言與計算機組織',
      longDesc: '這門課程讓我深入理解底層計算機運作原理，透過 RISC-V 組合語言實作 3 個程式：<ul><li><strong>Combination & Permutation 專案</strong>：實作組合與排列數計算程式，包括計算 mPn（排列）、mCn（組合）、m^n（次方）、以及 mHn（重複組合），學習如何用組合語言實作階乘、排列、組合等數學運算，以及遞迴函數的組合語言實作。</li><li><strong>Nameology of the Five Elements 專案</strong>：實作五格姓名學分析程式，處理字串輸入並進行複雜的數值計算，包括輸入姓名筆劃數、計算三才五格數值等功能，練習了字串處理與迴圈控制。</li><li><strong>Steiner Trees 專案</strong>：實作史坦納樹演算法，學習如何用組合語言處理圖形演算法，包括計算圖形中的最小史坦納樹、支援座標點輸入與輸出等功能，理解了如何在低階語言中實作複雜的演算法。</li></ul>每個專案都需要仔細管理暫存器、記憶體位置，以及函數呼叫的堆疊操作，使用 RISC-V Assembly Language 編寫源碼（.asm 檔案）。開發過程中，我必須手動管理暫存器、理解指令管線化、以及處理記憶體存取。',
      tech: '組合語言與計算機組織 ｜ RISC-V Assembly',
      image: './assets/img/portfolio/1122_AssemblyLanguage.png',
      github: 'https://github.com/tsz7250/1122_AssemblyLanguage'
    },
    {
      id: '1112_ComputerProgramming',
      title: '1112 - 程式設計二',
      longDesc: '這門課程專注於 C++ 物件導向程式設計，透過 5 個專案讓我扎實掌握 OOP 的核心概念：<ul><li><strong>BigFib 專案</strong>：實作大數運算的費波那契數列，練習遞迴與迭代的實作，以及大數運算的處理。</li><li><strong>CipherMachine 專案</strong>：實作字串處理與編碼機器，學習字元處理與檔案 I/O 操作。</li><li><strong>Graph 專案</strong>：實作圖形容器設計與路徑演算法，包括實作深度優先搜尋 (DFS) 與廣度優先搜尋 (BFS)，以及圖論與生成樹演算法。</li><li><strong>PokerDealer 專案</strong>：實作撲克牌發牌系統，練習類別設計與繼承，學習如何設計良好的物件導向架構。</li><li><strong>Quadrilaterals 專案</strong>：實作四邊形類別設計與點座標系統，深入理解虛擬函數、抽象類別與多型的概念，學習如何設計可擴展的類別層次結構。</li></ul>每個專案都強調良好的程式設計習慣，包括類別封裝、介面設計、以及程式碼重用。這些練習為我後續的軟體開發奠定了堅實的基礎。',
      tech: '程式設計二 ｜ C++',
      image: './assets/img/portfolio/1112_ComputerProgramming.png',
      github: 'https://github.com/tsz7250/1112_ComputerProgramming'
    },
    {
      id: '1111_WebProgramming',
      title: '1111 - Web 程式設計',
      longDesc: '這是我第一門 Web 程式設計課程，透過多個作業讓我對基礎的 Web 開發技術有了完整的理解：<ul><li><strong>Captcha 專案</strong>：實作智能驗證碼系統，使用圖片分類驗證用戶身份，包含 IP 封鎖功能，學習如何產生圖形驗證碼並驗證使用者輸入，理解 Session 管理與安全性考量。</li><li><strong>LineChart 專案</strong>：使用 Google Charts API 製作互動式折線圖，支援 CSV 資料匯入和處理，學習如何將資料視覺化，以及如何處理不同格式的資料檔案。</li><li><strong>Querying 專案</strong>：實作多格式資料查詢系統，支援 CSV、XML 和 URL 資料來源的篩選 and 查詢，練習讀取與解析 CSV、XML 格式的檔案，並將資料存入資料庫，實作複雜的 SQL 查詢與前端篩選功能。</li></ul>技術棧包含 HTML 結構設計、CSS 樣式美化、JavaScript 互動處理、PHP 後端邏輯、以及 MySQL 資料庫操作。',
      tech: 'Web 程式設計 ｜ HTML, PHP, JavaScript, Google Charts, MySQL',
      image: './assets/img/portfolio/1111_WebProgramming.png',
      github: 'https://github.com/tsz7250/1111_WebProgramming'
    }
  ];
// END_PROJECTS_DATA

  const projectMap = projects.reduce((map, project) => {
    map[project.id] = project;
    return map;
  }, {});

  // ============================================
  // Project Detail Modal Behavior
  // ============================================
  const modal = document.querySelector('.project-modal');
  const modalImage = modal?.querySelector('.project-modal__image');
  const modalTitle = modal?.querySelector('.project-modal__title');
  const modalMeta = modal?.querySelector('.project-modal__meta');
  const modalDesc = modal?.querySelector('.project-modal__desc');
  const modalGithub = modal?.querySelector('.project-modal__btn');
  const modalOverlay = modal?.querySelector('.project-modal__overlay');
  const modalCloseBtn = modal?.querySelector('.project-modal__close');

  let lastFocusedCard = null;

  const openProjectModal = (projectId) => {
    if (!modal) return;
    const project = projectMap[projectId];
    if (!project) return;

    if (modalImage) {
      modalImage.src = project.image;
      modalImage.alt = project.title;
    }
    if (modalTitle) {
      modalTitle.textContent = project.title;
    }
    if (modalMeta) {
      modalMeta.textContent = project.tech;
    }
    if (modalDesc) {
      modalDesc.innerHTML = project.longDesc;
    }
    if (modalGithub) {
      modalGithub.href = project.github;
    }

    modal.classList.add('project-modal--active');
    document.body.classList.add('no-scroll');
    modal.setAttribute('aria-hidden', 'false');

    if (modalCloseBtn) {
      modalCloseBtn.focus();
    }
  };

  const closeProjectModal = () => {
    if (!modal) return;
    // 重置圖片放大狀態
    if (modalImage && modalImage.classList.contains('project-modal__image--zoomed')) {
      modalImage.classList.remove('project-modal__image--zoomed', 'zoom-out');
    }
    modal.classList.remove('project-modal--active');
    document.body.classList.remove('no-scroll');
    modal.setAttribute('aria-hidden', 'true');

    if (lastFocusedCard) {
      lastFocusedCard.focus();
    }
  };

  // Card click -> open modal
  document.querySelectorAll('.project-card').forEach(card => {
    const id = card.dataset.projectId;
    if (!id) return;
    card.style.cursor = 'pointer';

    card.addEventListener('click', (event) => {
      const target = event.target;
      if (target.closest && target.closest('.project-card__btn')) {
        // 直接點 GitHub 按鈕時不要打開 Modal
        return;
      }
      lastFocusedCard = card;
      openProjectModal(id);
    });
  });

  // Image zoom functionality
  if (modalImage) {
    modalImage.addEventListener('click', (event) => {
      event.stopPropagation();
      const isZoomed = modalImage.classList.contains('project-modal__image--zoomed');
      
      if (isZoomed) {
        // 縮小：先添加 zooming-out 類，讓 transition 處理縮小
        // 保持 fixed 定位，讓圖片從螢幕中央縮小
        modalImage.classList.add('project-modal__image--zooming-out');
        modalImage.classList.remove('project-modal__image--zoomed');
        // 等待動畫完成後移除 zooming-out 類，此時圖片已經完全淡出
        setTimeout(() => {
          // 先確保圖片完全透明和隱藏，然後暫時移除 transition
          modalImage.style.opacity = '0';
          modalImage.style.visibility = 'hidden';
          modalImage.style.transition = 'none';
          // 移除 zooming-out 類（會移除 fixed 定位）
          // 使用 requestAnimationFrame 確保樣式已應用
          requestAnimationFrame(() => {
            modalImage.classList.remove('project-modal__image--zooming-out');
            // 再等一個 frame 後恢復 transition 和 visibility
            requestAnimationFrame(() => {
              modalImage.style.transition = '';
              modalImage.style.opacity = '';
              modalImage.style.visibility = '';
            });
          });
        }, 400); // 與 CSS transition 時間一致
      } else {
        // 放大：先讓圖片變透明，然後瞬間移動到螢幕中央，再淡入並放大
        // 這樣可以避免位置跳動時的視覺問題
        modalImage.style.opacity = '0';
        modalImage.style.transition = 'none';
        
        requestAnimationFrame(() => {
          // 先添加 zooming-in 類，讓圖片瞬間移動到螢幕中央（此時已透明，看不到跳動）
          modalImage.classList.add('project-modal__image--zooming-in');
          
          requestAnimationFrame(() => {
            // 恢復 transition，然後切換到放大狀態
            modalImage.style.transition = '';
            modalImage.style.opacity = '';
            modalImage.classList.remove('project-modal__image--zooming-in');
            modalImage.classList.add('project-modal__image--zoomed');
          });
        });
      }
    });
  }

  // Close button
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', () => {
      // 如果圖片處於放大狀態，先縮小圖片
      if (modalImage && modalImage.classList.contains('project-modal__image--zoomed')) {
        modalImage.classList.add('project-modal__image--zooming-out');
        modalImage.classList.remove('project-modal__image--zoomed');
        setTimeout(() => {
          modalImage.style.opacity = '0';
          modalImage.style.visibility = 'hidden';
          modalImage.style.transition = 'none';
          requestAnimationFrame(() => {
            modalImage.classList.remove('project-modal__image--zooming-out');
            requestAnimationFrame(() => {
              modalImage.style.transition = '';
              modalImage.style.opacity = '';
              modalImage.style.visibility = '';
            });
          });
        }, 400);
        return;
      }
      closeProjectModal();
    });
  }

  // Click overlay to close
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (event) => {
      if (event.target === modalOverlay) {
        // 如果圖片處於放大狀態，先縮小圖片
        if (modalImage && modalImage.classList.contains('project-modal__image--zoomed')) {
          modalImage.classList.add('project-modal__image--zooming-out');
          modalImage.classList.remove('project-modal__image--zoomed');
          setTimeout(() => {
            modalImage.style.opacity = '0';
            modalImage.style.transition = 'none';
            modalImage.classList.remove('project-modal__image--zooming-out');
            requestAnimationFrame(() => {
              modalImage.style.transition = '';
              modalImage.style.opacity = '';
            });
          }, 400);
          return;
        }
        closeProjectModal();
      }
    });
  }

  // Esc key to close
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' || event.key === 'Esc') {
      if (modal && modal.classList.contains('project-modal--active')) {
        // 如果圖片處於放大狀態，先縮小圖片
        if (modalImage && modalImage.classList.contains('project-modal__image--zoomed')) {
          modalImage.classList.add('project-modal__image--zooming-out');
          modalImage.classList.remove('project-modal__image--zoomed');
          setTimeout(() => {
            modalImage.style.opacity = '0';
            modalImage.style.transition = 'none';
            modalImage.classList.remove('project-modal__image--zooming-out');
            requestAnimationFrame(() => {
              modalImage.style.transition = '';
              modalImage.style.opacity = '';
            });
          }, 400);
          return;
        }
        closeProjectModal();
      }
    }
  });
});
