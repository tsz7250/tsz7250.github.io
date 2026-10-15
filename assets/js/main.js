document.addEventListener('DOMContentLoaded', () => {
  // ============================================
  // 1. Theme Controller (Midnight Dark vs Daylight Warm Light)
  // ============================================
  const themeToggleBtn = document.getElementById('theme-toggle');
  const storedTheme = localStorage.getItem('tsz_portfolio_theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  // 初始主題判定
  const initialTheme = storedTheme ? storedTheme : (systemPrefersDark ? 'midnight' : 'daylight');
  applyTheme(initialTheme);

  function applyTheme(theme) {
    if (theme === 'daylight') {
      document.body.classList.remove('scheme-midnight');
      document.body.classList.add('scheme-daylight');
    } else {
      document.body.classList.remove('scheme-daylight');
      document.body.classList.add('scheme-midnight');
    }
    localStorage.setItem('tsz_portfolio_theme', theme);
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const isCurrentlyDark = document.body.classList.contains('scheme-midnight');
      const nextTheme = isCurrentlyDark ? 'daylight' : 'midnight';
      applyTheme(nextTheme);
    });
  }

  // ============================================
  // 2. Trip.com Faceted Search, Filter, Sort & Pagination
  // ============================================
  const searchInput = document.getElementById('trip-search');
  const categoryRadios = document.querySelectorAll('input[name="trip-category"]');
  const typeFacetsContainer = document.getElementById('trip-type-facets');
  const typeFacetCountEl = document.getElementById('type-facet-count');
  const techFacetsContainer = document.getElementById('trip-tech-facets');
  const techFacetCountEl = document.getElementById('tech-facet-count');
  const resultTotalEl = document.getElementById('trip-result-total');
  const activeChipsContainer = document.getElementById('trip-active-chips');
  const sortSelect = document.getElementById('trip-sort-select');
  const mobileSortSelect = document.getElementById('mobile-sort-select');
  const cardsList = document.getElementById('trip-cards-list');
  const emptyState = document.getElementById('trip-empty-state');
  const paginationContainer = document.getElementById('trip-pagination');
  const resetBtn = document.getElementById('trip-reset-btn');
  const emptyResetBtn = document.getElementById('trip-empty-reset');

  // Mobile Drawer elements
  const mobileFilterTrigger = document.getElementById('mobile-filter-trigger');
  const mobileDrawerClose = document.getElementById('mobile-drawer-close');
  const mobileApplyBtn = document.getElementById('mobile-apply-btn');
  const mobileDrawerOverlay = document.getElementById('mobile-drawer-overlay');
  const tripSidebar = document.getElementById('trip-sidebar');
  const mobileActiveCountBadge = document.getElementById('mobile-active-count');

  // State
  let state = {
    category: 'personal', // 'personal' | 'academic' | 'all'
    selectedTypes: new Set(),
    selectedTechs: new Set(),
    searchQuery: '',
    sort: 'default',
    currentPage: 1,
    itemsPerPage: 6
  };

  // 獲取所有卡片 DOM 元素（作為資料來源與動態重排節點）
  let allCards = [];
  if (cardsList) {
    allCards = Array.from(cardsList.querySelectorAll('.trip-card'));
  }

  // 提取各專案的應用類型與技術標籤資料結構
  function getCardTopics(card) {
    const raw = card.dataset.topics || '';
    return raw.split(',').map(t => t.trim()).filter(Boolean);
  }

  function getCardTechs(card) {
    const raw = card.dataset.tech || '';
    return raw.split(',').map(t => t.trim()).filter(Boolean);
  }

  // 動態計算並更新左側專案應用類型 Facets（包含數量聯動）
  function renderTypeFacets() {
    if (!typeFacetsContainer) return;

    const typeCounts = {};
    allCards.forEach(card => {
      const cardCat = card.dataset.category;
      if (state.category !== 'all' && cardCat !== state.category) return;
      
      if (state.searchQuery) {
        const title = (card.dataset.title || '').toLowerCase();
        const topics = (card.dataset.topics || '').toLowerCase();
        const tech = (card.dataset.tech || '').toLowerCase();
        const q = state.searchQuery.toLowerCase();
        if (!title.includes(q) && !topics.includes(q) && !tech.includes(q)) return;
      }

      // 如果有選中特定技術棧，應用類型需與之聯動過濾
      if (state.selectedTechs.size > 0) {
        const cardTechs = getCardTechs(card);
        for (const reqTech of state.selectedTechs) {
          if (!cardTechs.includes(reqTech)) return;
        }
      }

      const topics = getCardTopics(card);
      topics.forEach(t => {
        typeCounts[t] = (typeCounts[t] || 0) + 1;
      });
    });

    const sortedTypes = Object.keys(typeCounts).sort((a, b) => {
      return typeCounts[b] - typeCounts[a] || a.localeCompare(b);
    });

    if (typeFacetCountEl) {
      typeFacetCountEl.textContent = sortedTypes.length;
    }

    typeFacetsContainer.innerHTML = '';
    if (sortedTypes.length === 0) {
      typeFacetsContainer.innerHTML = '<span style="font-size: 0.8rem; opacity: 0.6; padding: 4px;">無相關類型標籤</span>';
      return;
    }

    sortedTypes.forEach(type => {
      const pill = document.createElement('button');
      pill.type = 'button';
      pill.className = 'trip-type-pill' + (state.selectedTypes.has(type) ? ' active' : '');
      pill.dataset.type = type;
      pill.innerHTML = `<span>${type}</span><span class="trip-type-pill__count">(${typeCounts[type]})</span>`;
      
      pill.addEventListener('click', () => {
        if (state.selectedTypes.has(type)) {
          state.selectedTypes.delete(type);
        } else {
          state.selectedTypes.add(type);
        }
        state.currentPage = 1;
        applyFilters();
      });

      typeFacetsContainer.appendChild(pill);
    });
  }

  // 動態計算並更新左側技術棧 Facets（包含數量聯動）
  function renderTechFacets() {
    if (!techFacetsContainer) return;

    // 依據目前的大類、搜尋關鍵字與選中類型，統計各技術棧出現頻率
    const techCounts = {};
    allCards.forEach(card => {
      const cardCat = card.dataset.category;
      if (state.category !== 'all' && cardCat !== state.category) return;
      
      if (state.searchQuery) {
        const title = (card.dataset.title || '').toLowerCase();
        const topics = (card.dataset.topics || '').toLowerCase();
        const tech = (card.dataset.tech || '').toLowerCase();
        const q = state.searchQuery.toLowerCase();
        if (!title.includes(q) && !topics.includes(q) && !tech.includes(q)) return;
      }

      // 如果有選中特定應用類型，技術棧需與之聯動過濾
      if (state.selectedTypes.size > 0) {
        const cardTopics = getCardTopics(card);
        for (const reqTopic of state.selectedTypes) {
          if (!cardTopics.includes(reqTopic)) return;
        }
      }

      const techs = getCardTechs(card);
      techs.forEach(t => {
        techCounts[t] = (techCounts[t] || 0) + 1;
      });
    });

    // 依數量排序
    const sortedTechs = Object.keys(techCounts).sort((a, b) => {
      return techCounts[b] - techCounts[a] || a.localeCompare(b);
    });

    if (techFacetCountEl) {
      techFacetCountEl.textContent = sortedTechs.length;
    }

    techFacetsContainer.innerHTML = '';
    if (sortedTechs.length === 0) {
      techFacetsContainer.innerHTML = '<span style="font-size: 0.8rem; opacity: 0.6; padding: 4px;">無相關技術標籤</span>';
      return;
    }

    sortedTechs.forEach(tech => {
      const pill = document.createElement('button');
      pill.type = 'button';
      pill.className = 'trip-tech-pill' + (state.selectedTechs.has(tech) ? ' active' : '');
      pill.dataset.tech = tech;
      pill.innerHTML = `<span>${tech}</span><span class="trip-tech-pill__count">(${techCounts[tech]})</span>`;
      
      pill.addEventListener('click', () => {
        if (state.selectedTechs.has(tech)) {
          state.selectedTechs.delete(tech);
        } else {
          state.selectedTechs.add(tech);
        }
        state.currentPage = 1;
        applyFilters();
      });

      techFacetsContainer.appendChild(pill);
    });
  }

  // 更新分類 Radio 的各類數量徽章
  function updateCategoryCounts() {
    let personalCount = 0;
    let academicCount = 0;
    let allCount = 0;

    allCards.forEach(card => {
      const cardCat = card.dataset.category;
      allCount++;
      if (cardCat === 'personal') personalCount++;
      if (cardCat === 'academic') academicCount++;
    });

    const elPersonal = document.getElementById('count-cat-personal');
    const elAcademic = document.getElementById('count-cat-academic');
    const elAll = document.getElementById('count-cat-all');

    if (elPersonal) elPersonal.textContent = personalCount;
    if (elAcademic) elAcademic.textContent = academicCount;
    if (elAll) elAll.textContent = allCount;
  }

  // 渲染頂部 Active Chips（已套用過濾條件）
  function renderActiveChips() {
    if (!activeChipsContainer) return;
    activeChipsContainer.innerHTML = '';

    // 大類 Chip (若不是預設 personal 或是全部)
    if (state.category !== 'personal') {
      const catLabel = state.category === 'academic' ? '學校專案' : '全部作品';
      const chip = document.createElement('span');
      chip.className = 'trip-chip';
      chip.innerHTML = `${catLabel} <span class="trip-chip__close" title="重置為個人專案">×</span>`;
      chip.querySelector('.trip-chip__close').addEventListener('click', () => {
        setCategory('personal');
      });
      activeChipsContainer.appendChild(chip);
    }

    // 關鍵字 Chip
    if (state.searchQuery) {
      const chip = document.createElement('span');
      chip.className = 'trip-chip';
      chip.innerHTML = `關鍵字: "${state.searchQuery}" <span class="trip-chip__close" title="清除搜尋">×</span>`;
      chip.querySelector('.trip-chip__close').addEventListener('click', () => {
        state.searchQuery = '';
        if (searchInput) searchInput.value = '';
        state.currentPage = 1;
        applyFilters();
      });
      activeChipsContainer.appendChild(chip);
    }

    // 專案應用類型 Chips
    state.selectedTypes.forEach(type => {
      const chip = document.createElement('span');
      chip.className = 'trip-chip';
      chip.innerHTML = `${type} <span class="trip-chip__close" title="取消類型">×</span>`;
      chip.querySelector('.trip-chip__close').addEventListener('click', () => {
        state.selectedTypes.delete(type);
        state.currentPage = 1;
        applyFilters();
      });
      activeChipsContainer.appendChild(chip);
    });

    // 程式語言 / 技術標籤 Chips
    state.selectedTechs.forEach(tech => {
      const chip = document.createElement('span');
      chip.className = 'trip-chip';
      chip.innerHTML = `${tech} <span class="trip-chip__close" title="取消標籤">×</span>`;
      chip.querySelector('.trip-chip__close').addEventListener('click', () => {
        state.selectedTechs.delete(tech);
        state.currentPage = 1;
        applyFilters();
      });
      activeChipsContainer.appendChild(chip);
    });
  }

  // 排序函式
  function sortCards(cards) {
    const list = [...cards];
    switch (state.sort) {
      case 'date-desc':
        return list.sort((a, b) => (b.dataset.date || '').localeCompare(a.dataset.date || ''));
      case 'date-asc':
        return list.sort((a, b) => (a.dataset.date || '').localeCompare(b.dataset.date || ''));
      case 'name-asc':
        return list.sort((a, b) => (a.dataset.title || '').localeCompare(b.dataset.title || ''));
      case 'default':
      default:
        // 預設排序：個人專案在前，接著依日期由新至舊
        return list.sort((a, b) => {
          if (a.dataset.category !== b.dataset.category) {
            return a.dataset.category === 'personal' ? -1 : 1;
          }
          return (b.dataset.date || '').localeCompare(a.dataset.date || '');
        });
    }
  }

  // 渲染分頁導航器
  function renderPagination(totalPages) {
    if (!paginationContainer) return;
    paginationContainer.innerHTML = '';

    if (totalPages <= 1) {
      paginationContainer.style.display = 'none';
      return;
    }
    paginationContainer.style.display = 'flex';

    // 前一頁
    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'trip-page-btn';
    prevBtn.innerHTML = '‹';
    prevBtn.ariaLabel = '上一頁';
    prevBtn.disabled = state.currentPage === 1;
    prevBtn.addEventListener('click', () => {
      if (state.currentPage > 1) {
        state.currentPage--;
        applyFilters(false);
        scrollToPortfolio();
      }
    });
    paginationContainer.appendChild(prevBtn);

    // 頁碼數字按鈕
    for (let p = 1; p <= totalPages; p++) {
      const pageBtn = document.createElement('button');
      pageBtn.type = 'button';
      pageBtn.className = 'trip-page-btn' + (p === state.currentPage ? ' active' : '');
      pageBtn.textContent = p;
      pageBtn.addEventListener('click', () => {
        state.currentPage = p;
        applyFilters(false);
        scrollToPortfolio();
      });
      paginationContainer.appendChild(pageBtn);
    }

    // 下一頁
    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'trip-page-btn';
    nextBtn.innerHTML = '›';
    nextBtn.ariaLabel = '下一頁';
    nextBtn.disabled = state.currentPage === totalPages;
    nextBtn.addEventListener('click', () => {
      if (state.currentPage < totalPages) {
        state.currentPage++;
        applyFilters(false);
        scrollToPortfolio();
      }
    });
    paginationContainer.appendChild(nextBtn);
  }

  function scrollToPortfolio() {
    const portfolioSec = document.getElementById('portfolio');
    if (portfolioSec) {
      portfolioSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // 核心過濾與渲染邏輯
  function applyFilters(shouldUpdateFacets = true) {
    // 1. 匹配篩選
    const matchedCards = allCards.filter(card => {
      // 類別比對
      const cat = card.dataset.category;
      if (state.category !== 'all' && cat !== state.category) {
        return false;
      }

      // 關鍵字比對
      if (state.searchQuery) {
        const title = (card.dataset.title || '').toLowerCase();
        const topics = (card.dataset.topics || '').toLowerCase();
        const tech = (card.dataset.tech || '').toLowerCase();
        const q = state.searchQuery.toLowerCase();
        if (!title.includes(q) && !topics.includes(q) && !tech.includes(q)) {
          return false;
        }
      }

      // 專案應用類型比對 (AND 邏輯：必須滿足所有選中的類型)
      if (state.selectedTypes.size > 0) {
        const cardTopics = getCardTopics(card);
        for (const reqTopic of state.selectedTypes) {
          if (!cardTopics.includes(reqTopic)) {
            return false;
          }
        }
      }

      // 程式語言 / 框架比對 (AND 邏輯：必須滿足所有選中的技術)
      if (state.selectedTechs.size > 0) {
        const cardTechs = getCardTechs(card);
        for (const reqTech of state.selectedTechs) {
          if (!cardTechs.includes(reqTech)) {
            return false;
          }
        }
      }

      return true;
    });

    // 2. 排序
    const sortedCards = sortCards(matchedCards);

    // 3. 分頁切割
    const totalPages = Math.ceil(sortedCards.length / state.itemsPerPage);
    if (state.currentPage > totalPages && totalPages > 0) {
      state.currentPage = 1;
    }

    const startIndex = (state.currentPage - 1) * state.itemsPerPage;
    const endIndex = startIndex + state.itemsPerPage;
    const pagedCards = sortedCards.slice(startIndex, endIndex);

    // 4. DOM 更新
    allCards.forEach(card => {
      card.style.display = 'none';
    });

    pagedCards.forEach(card => {
      card.style.display = 'flex';
      // 依排序重新 appendChild 調整順序
      if (cardsList) cardsList.appendChild(card);
    });

    // 5. 總數與空狀態顯示
    if (resultTotalEl) {
      resultTotalEl.innerHTML = `共找到 <strong>${sortedCards.length}</strong> 個專案`;
    }
    if (mobileActiveCountBadge) {
      mobileActiveCountBadge.textContent = sortedCards.length;
    }

    if (emptyState) {
      emptyState.style.display = sortedCards.length === 0 ? 'block' : 'none';
    }

    // 6. 渲染 Active Chips 與 分頁器
    renderActiveChips();
    renderPagination(totalPages);

    // 7. 動態聯動專案應用類型與技術標籤清單
    if (shouldUpdateFacets) {
      renderTypeFacets();
      renderTechFacets();
    }
  }

  function setCategory(cat) {
    state.category = cat;
    categoryRadios.forEach(radio => {
      radio.checked = radio.value === cat;
    });
    // 清空分面標籤選取
    state.selectedTypes.clear();
    state.selectedTechs.clear();
    state.currentPage = 1;
    applyFilters(true);
  }

  // 事件綁定：分類切換
  categoryRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.checked) {
        setCategory(e.target.value);
      }
    });
  });

  // 事件綁定：搜尋關鍵字 (防抖)
  let searchTimeout;
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        state.searchQuery = e.target.value.trim();
        state.currentPage = 1;
        applyFilters(true);
      }, 200);
    });
  }

  // 事件綁定：排序變更
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      state.sort = e.target.value;
      if (mobileSortSelect) mobileSortSelect.value = state.sort;
      state.currentPage = 1;
      applyFilters(false);
    });
  }
  if (mobileSortSelect) {
    mobileSortSelect.addEventListener('change', (e) => {
      state.sort = e.target.value;
      if (sortSelect) sortSelect.value = state.sort;
      state.currentPage = 1;
      applyFilters(false);
    });
  }

  // 事件綁定：重置按鈕
  function resetAllFilters() {
    state.category = 'personal';
    state.selectedTypes.clear();
    state.selectedTechs.clear();
    state.searchQuery = '';
    state.sort = 'default';
    state.currentPage = 1;

    if (searchInput) searchInput.value = '';
    if (sortSelect) sortSelect.value = 'default';
    if (mobileSortSelect) mobileSortSelect.value = 'default';
    categoryRadios.forEach(r => r.checked = r.value === 'personal');

    applyFilters(true);
  }

  if (resetBtn) resetBtn.addEventListener('click', resetAllFilters);
  if (emptyResetBtn) emptyResetBtn.addEventListener('click', resetAllFilters);

  // 手機端抽屜展開/關閉
  function openMobileDrawer() {
    if (tripSidebar) tripSidebar.classList.add('drawer-open');
    if (mobileDrawerOverlay) mobileDrawerOverlay.classList.add('active');
    document.body.classList.add('no-scroll');
  }

  function closeMobileDrawer() {
    if (tripSidebar) tripSidebar.classList.remove('drawer-open');
    if (mobileDrawerOverlay) mobileDrawerOverlay.classList.remove('active');
    document.body.classList.remove('no-scroll');
  }

  if (mobileFilterTrigger) mobileFilterTrigger.addEventListener('click', openMobileDrawer);
  if (mobileDrawerClose) mobileDrawerClose.addEventListener('click', closeMobileDrawer);
  if (mobileApplyBtn) mobileApplyBtn.addEventListener('click', closeMobileDrawer);
  if (mobileDrawerOverlay) mobileDrawerOverlay.addEventListener('click', closeMobileDrawer);

  // 初始初始化
  updateCategoryCounts();
  applyFilters(true);

  // ============================================
  // 3. Project Detail Modal Data
  // ============================================
  // START_PROJECTS_DATA
  const projects = [
    {
      id: 'Currency_chart',
      title: 'Currency_chart',
      category: 'personal',
      badge: '個人專案',
      date: '2025-05',
      topics: ["爬蟲自動化", "資料視覺化", "網頁應用"],
      techStack: ["Python", "Flask", "Playwright", "Chart.js"],
      tags: ["爬蟲自動化", "資料視覺化", "網頁應用", "Python", "Flask", "Playwright", "Chart.js"],
      longDesc: '這是一個功能完整的匯率追蹤應用程式，使用 Python Flask 框架開發。系統使用 Playwright 和 Chromium 自動化瀏覽器來從 Mastercard 公開服務獲取匯率資料，並在背景自動更新。核心功能包括多時間區間圖表顯示（近 7/30/90/180 天）、幣別搜尋與快速交換介面、歷史記錄查看功能等。首次啟動時會自動檢查並更新匯率數據，如需獲取 Cookies 會自動顯示瀏覽器窗口約 10 秒，整個過程完全自動化。',
      tech: 'Python Flask, Chart.js',
      image: './assets/img/portfolio/Currency_chart.png',
      github: 'https://github.com/tsz7250/Currency_chart'
    },
    {
      id: 'yzuCourseBot',
      title: 'yzuCourseBot',
      category: 'personal',
      badge: '個人專案',
      date: '2024-09',
      topics: ["爬蟲自動化", "桌面應用", "OCR辨識"],
      techStack: ["Python", "Flet", "CNN"],
      tags: ["爬蟲自動化", "桌面應用", "OCR辨識", "Python", "Flet", "CNN"],
      longDesc: '這是一個針對元智大學選課系統開發的自動化工具，基於原始 yzuCourseBot 進行 fork 並針對 Windows 環境進行深度優化。主要改進包括：<ul><li>更新套件相容性以支援 Python 3.12。</li><li>修正 Windows 平台的依賴問題。</li><li>提供完整的 Windows 安裝指南。</li><li>優化執行穩定性。</li><li>新增可執行檔降低使用門檻。</li></ul>專案提供兩種執行方式：使用 Flet 框架開發的 GUI 圖形介面版本，以及傳統的命令列版本。驗證碼識別使用 CNN 模型進行 OCR 識別。我還使用 PyInstaller 將程式打包成 .exe 執行檔，並建立了自動化建置流程。這個專案幫助許多同學在選課期間節省了大量時間。',
      tech: 'Python',
      image: './assets/img/portfolio/yzuCourseBot.png',
      github: 'https://github.com/tsz7250/yzuCourseBot'
    },
    {
      id: 'add-subtitles-extended',
      title: 'add-subtitles-extended',
      category: 'personal',
      badge: '個人專案',
      date: '2024-04',
      topics: ["瀏覽器擴充", "多媒體工具"],
      techStack: ["JavaScript", "Web Ext", "OpenCC"],
      tags: ["瀏覽器擴充", "多媒體工具", "JavaScript", "Web Ext", "OpenCC"],
      longDesc: '這是一個 Firefox 瀏覽器擴充套件，基於原始 add-subtitles 進行修復及優化。主要功能是為網頁上的任何 video 元素新增外部字幕檔案。我新增了多項功能：<ul><li>支援 ASS/SSA 字幕格式（原本只支援 SRT、VTT）。</li><li>使用 OpenCC-JS 實現自動簡體中文轉繁體中文。</li><li>支援 ZIP 壓縮檔中的字幕（使用 JSZip 函式庫）。</li><li>修復全螢幕播放功能。</li><li>改善外觀設計。</li></ul>同時，我重構了內容腳本注入邏輯，增加錯誤處理與狀態檢查，優化 OpenCC 加載流程，修復了字幕上傳功能。使用者可以調整字幕位置、大小和顏色，並使用鍵盤快捷鍵控制。',
      tech: 'JavaScript (Web Ext)',
      image: './assets/img/portfolio/add-subtitles-extended.png',
      github: 'https://github.com/tsz7250/add-subtitles-extended'
    },
    {
      id: 'Coursio',
      title: 'Coursio',
      category: 'personal',
      badge: '個人專案',
      date: '2024-06',
      topics: ["桌面應用", "自動化工具"],
      techStack: ["Vue 3", "Vite", "Electron", "SQLite"],
      tags: ["桌面應用", "自動化工具", "Vue 3", "Vite", "Electron", "SQLite"],
      longDesc: '本專案參考 Wanna Class 進行架構重構與功能擴充，打造一個現代化的元智大學選課助手。技術架構由原始的 Vanilla JS + jQuery 升級為 Vue 3 + Vite + SCSS，並使用 Electron 封裝為桌面應用程式。主要功能包括：<ul><li><strong>我的課表</strong>：直觀記錄歷年課程，支援匯出功能。</li><li><strong>課程查詢</strong>：快速檢索全校課表，顯示學分、教室及教授等詳細資訊。</li><li><strong>自動選課</strong>：模擬使用者行為進行全自動化搶課，大幅提升成功率。</li><li><strong>成績查詢</strong>：快速檢閱各學期成績紀錄。</li><li><strong>系統設定</strong>：彈性調整重試頻率與登入偏好。</li></ul>專案強調安全性與效能，承諾不紀錄帳號密碼，並優化資源消耗。透過 SQLite3 管理資料並整合 Puppeteer 處理網頁自動化，有效解決了官網操作繁瑣與驗證碼搜尋的痛點。',
      tech: 'Electron',
      image: './assets/img/portfolio/Coursio.png',
      github: 'https://github.com/tsz7250/Coursio'
    },
    {
      id: 'n8n-launcher',
      title: 'n8n-launcher',
      category: 'personal',
      badge: '個人專案',
      date: '2025-01',
      topics: ["DevOps", "系統工具"],
      techStack: ["Docker", "Batchfile"],
      tags: ["DevOps", "系統工具", "Docker", "Batchfile"],
      longDesc: '這是一個專為 Windows 系統設計的 n8n Docker 容器管理工具，提供簡單易用的圖形化選單介面來管理 n8n 工作流程自動化平台。主要功能包括：<ul><li><strong>一鍵啟動</strong>：自動檢查並啟動 Docker，無需手動配置。</li><li><strong>自動配置</strong>：首次使用時自動建立 docker-compose.yml 配置檔。</li><li><strong>資料備份</strong>：一鍵備份 n8n 工作流程和 PostgreSQL 資料庫。</li><li><strong>資料還原</strong>：輕鬆還原先前備份的資料。</li><li><strong>重新安裝</strong>：快速重新安裝並可選擇保留資料。</li></ul>工具使用 Batch 腳本開發，整合 Docker Compose 來管理容器生命週期。腳本會自動檢查 Docker Desktop 運行狀態，提供友好的錯誤提示，並在服務就緒後自動開啟瀏覽器。',
      tech: 'Batchfile, Docker',
      image: './assets/img/portfolio/n8n-launcher.png',
      github: 'https://github.com/tsz7250/n8n-launcher'
    },
    {
      id: 'ezoe-work_scraper',
      title: 'ezoe-work_scraper',
      category: 'personal',
      badge: '個人專案',
      date: '2025-03',
      topics: ["爬蟲自動化", "檔案處理"],
      techStack: ["Python", "BeautifulSoup", "Pandoc"],
      tags: ["爬蟲自動化", "檔案處理", "Python", "BeautifulSoup", "Pandoc"],
      longDesc: '這是一個針對 ezoe.work 網站的文章爬蟲工具，可以批次抓取文章並輸出為格式化的 DOCX 與 PDF 檔案。主要功能包括：<ul><li><strong>批次爬取</strong>：從 urls.txt 或指定 txt 檔案讀取 URL，每篇產生獨立的 Markdown 檔案（書名_篇數.md）。</li><li><strong>合併轉換</strong>：依書名自動合併多篇 Markdown，轉成一本完整的 DOCX 檔案，可設定行距、標題樣式等格式。</li><li><strong>簡轉繁與 PDF</strong>：程式會將 DOCX 以 Microsoft Word 進行簡體轉繁體，並轉成 PDF 檔案。需在 Windows 環境且已安裝 Microsoft Word，否則會略過此步驟。</li><li><strong>一鍵流程</strong>：執行 main.py 可依序完成「爬取 → 轉 DOCX/PDF」的完整流程。</li></ul>技術上使用 Python 開發，整合 BeautifulSoup 進行網頁解析、pypandoc 進行 Markdown 轉 DOCX、pywin32 進行 Word 自動化操作（簡轉繁與 PDF 轉換）。',
      tech: 'Python, Scrapy',
      image: './assets/img/portfolio/ezoe-work_scraper.png',
      github: 'https://github.com/tsz7250/ezoe-work_scraper'
    },
    {
      id: 'bible-tracker',
      title: 'bible-tracker',
      category: 'personal',
      badge: '個人專案',
      date: '2025-02',
      topics: ["機器人 / Bot", "雲端應用"],
      techStack: ["TypeScript", "LINE Bot API", "GAS"],
      tags: ["機器人 / Bot", "雲端應用", "TypeScript", "LINE Bot API", "GAS"],
      longDesc: '這是一個以 LINE Bot + Google Apps Script (GAS) 打造的聖經與生命讀經進度追蹤應用。系統幫助小組成員記錄每日讀經、自動同步一年讀經計畫與對應的生命讀經篇目，並即時統計群組排名。主要功能包括：<ul><li><strong>多元記錄模式</strong>：支援自由讀經、一年計畫與生命讀經的獨立勾選與智慧同步。</li><li><strong>進度儀表板</strong>：即時視覺化舊約、新約及生命讀經的完成百分比。</li><li><strong>群組互動</strong>：透過 LINE Bot 取得專屬連結，並查看成員間的閱讀比例與即時排名。</li><li><strong>安全與優化</strong>：實作 SHA-256 加密的 PIN 碼驗證，並提供批次儲存邏輯以提升使用者體驗。</li></ul>專案整合了 LINE Messaging API 與 Google Sheets，展現了如何利用雲端工具解決社群協作與個人進度管理的需求。',
      tech: 'LINE Bot, Google Apps Script',
      image: './assets/img/portfolio/bible-tracker.png',
      github: 'https://github.com/tsz7250/bible-tracker'
    },
    {
      id: '1131_Chatbot_Final',
      title: '電影AI助手聊天機器人',
      category: 'academic',
      badge: '學校專案 · 期末',
      date: '2025-01',
      topics: ["AI / LLM", "機器人 / Bot", "多媒體工具"],
      techStack: ["Python", "Flask", "Gemini", "LINE Bot API", "TMDB API"],
      tags: ["AI / LLM", "機器人 / Bot", "多媒體工具", "Python", "Flask", "Gemini", "LINE Bot API", "TMDB API"],
      longDesc: '這是一個期末分組報告專案，我們開發了一個功能豐富的多模態 AI 聊天機器人，專門提供電影相關服務。系統提供四大聊天模式：<ul><li><strong>聊天模式 (GEMINI)</strong>：與 Google Gemini AI 進行自然語言對話。</li><li><strong>電影查詢 (SEARCH_MOVIE)</strong>：搜尋 TMDB 電影資料庫獲取詳細資訊。</li><li><strong>以圖搜片 (GUESS_MOVIE)</strong>：上傳電影劇照或海報讓 AI 自動識別。</li><li><strong>字幕翻譯 (SUB_TRANSLATE)</strong>：自動生成影片字幕並翻譯成多國語言。</li></ul>技術架構使用 Flask 作為後端框架，整合 Google Gemini、LINE Bot SDK、Microsoft Azure (翻譯、語音、語言分析)、TMDB API，並使用 FFmpeg 處理多媒體檔案。系統支援 LINE Bot 和網頁版雙重介面，能夠處理圖片、音訊、影片等多媒體檔案，實現即時字幕生成與嵌入。專案採用模組化架構設計，將各功能封裝成獨立模組，便於維護與擴展。',
      tech: '微型應用程式設計實務 ｜ Line Bot, Gemini, TMDB API',
      image: './assets/img/portfolio/1131_Chatbot_Final.png',
      github: 'https://github.com/tsz7250/undergrad-archive/tree/main/1131_Chatbot_Final'
    },
    {
      id: '1122_Web_Final',
      title: '卡利西里餐廳訂餐系統',
      category: 'academic',
      badge: '學校專案 · 期末',
      date: '2024-06',
      topics: ["網頁應用", "資料視覺化", "AI / LLM"],
      techStack: ["Python", "Flask", "Plotly.js", "Gemini", "Canvas"],
      tags: ["網頁應用", "資料視覺化", "AI / LLM", "Python", "Flask", "Plotly.js", "Gemini", "Canvas"],
      longDesc: '這是一個完整的餐廳訂餐模擬系統，使用 Python Flask 作為後端框架開發的期末分組報告專案。系統提供完整的點餐功能：<ul><li><strong>直接點餐</strong>：瀏覽完整菜單並選擇餐點。</li><li><strong>隨機點餐系統</strong>：智能推薦功能。</li><li><strong>購物車管理</strong>：即時管理訂單內容和總價計算。</li><li><strong>智能聊天機器人</strong>：整合 Google Gemini AI 與 LangChain 框架，可以回答用戶關於餐點的問題並提供個性化推薦。</li><li><strong>數據分析</strong>：使用 Pandas 處理銷售數據，並使用 PlotlyJS 繪製互動式圖表，實現多維度分析（按餐點類型、時間等維度）。</li><li><strong>營業管理模擬</strong>：包括公休時間設定、即時營業狀態更新、營業時間智能提醒。</li></ul>前端使用 HTML5 Canvas 實現創新的視覺效果，並採用響應式設計支援桌面和行動裝置。數據儲存使用 JSON 格式儲存菜單和配置數據，CSV 格式儲存銷售數據。',
      tech: '網站程式設計實務 ｜ Flask, PlotlyJS, Gemini',
      image: './assets/img/portfolio/1122_Web_Final.png',
      github: 'https://github.com/tsz7250/undergrad-archive/tree/main/1122_Web_Final'
    },
    {
      id: '1111_WebProgramming_Final',
      title: '隨機選擇器與記帳系統',
      category: 'academic',
      badge: '學校專案 · 期末',
      date: '2023-01',
      topics: ["網頁應用", "資料庫系統"],
      techStack: ["PHP", "MySQL", "JavaScript", "HTML/CSS"],
      tags: ["網頁應用", "資料庫系統", "PHP", "MySQL", "JavaScript", "HTML/CSS"],
      longDesc: '這是一個校園美食隨機選擇器系統，作為 Web 程式設計課程的期末專題報告。系統提供以下功能：<ul><li><strong>隨機選擇功能</strong>：支援食物類別和餐廳類型的多層級篩選，智能推薦演算法幫助學生快速決定要吃什麼。</li><li><strong>用戶管理系統</strong>：包括用戶註冊、登入驗證、會話管理（使用 PHP Session），並實現了密碼加密與 SQL 注入防護等安全性措施。</li><li><strong>記帳系統</strong>：讓使用者可以記錄每次消費金額，支援依食物類別統計支出、依日期範圍查詢記錄、計算總消費金額等功能。</li><li><strong>歷史功能</strong>：可以查看過去的選擇記錄和消費明細，並提供視覺化消費趨勢圖表。</li></ul>技術架構使用 HTML/CSS/JavaScript 處理前端，PHP 處理後端邏輯，MySQL 資料庫儲存資料，採用正規化的資料表結構設計。系統採用響應式設計，支援手機和電腦使用。',
      tech: 'Web 程式設計 ｜ HTML, CSS, JS, PHP, MySQL',
      image: './assets/img/portfolio/1111_WebProgramming_Final.png',
      github: 'https://github.com/tsz7250/undergrad-archive/tree/main/1111_WebProgramming_Final'
    },
    {
      id: '1142_OpenPlatformSoftware_Final',
      title: '中華民國智慧財產局專利行政實務智能客服',
      category: 'academic',
      badge: '學校專案 · 期末',
      date: '2025-06',
      topics: ["AI / LLM", "機器人 / Bot", "RAG檢索"],
      techStack: ["Python", "RAG", "LLM", "LINE Bot API"],
      tags: ["AI / LLM", "機器人 / Bot", "RAG檢索", "Python", "RAG", "LLM", "LINE Bot API"],
      longDesc: '這是一個專為中華民國智慧財產局（TIPO）專利常見問答 (FAQ) 開放資料集打造的專利問答系統，基於混合檢索與 LLM 技術開發。系統提供以下主要功能與特色：<ul><li><strong>混合檢索架構</strong>：整合關鍵字、BM25 與向量相似度搜尋（Hybrid Search），並搭配 CrossEncoder 進行重排序，大幅提升檢索準確率。</li><li><strong>雙代理機制 (Dual-Agent)</strong>：運用 Agent 1 進行初步回答，Agent 2 進行審查與補充，並內建對齊與覆蓋率救援機制。</li><li><strong>上下文感知與重寫</strong>：自動將使用者的提問進行上下文感知重寫，以提供更精確的檢索結果。</li><li><strong>智慧快取機制</strong>：支援精確比對與模糊比對快取，有效降低 LLM 推論成本與系統回應延遲。</li><li><strong>多端支援與本地部署</strong>：提供 Web UI 與 LINE Bot 雙平台存取，系統經過優化，可在 6GB VRAM（如 RTX 2060）的消費級設備上流暢運行。</li></ul>這個專案展示了如何結合 RAG 架構與多代理系統來解決專業領域的問答需求。',
      tech: '開放平台軟體 ｜ RAG, LLM, Python',
      image: './assets/img/portfolio/1142_OpenPlatformSoftware_Final.png',
      github: 'https://github.com/tsz7250/undergrad-archive/tree/main/1142_OpenPlatformSoftware_Final'
    },
    {
      id: '1131_Chatbot',
      title: '1131 - 微型應用程式設計實務',
      category: 'academic',
      badge: '學校專案 · 作業',
      date: '2024-11',
      topics: ["AI / LLM", "機器人 / Bot"],
      techStack: ["Python", "Flask", "Gemini", "Azure", "LangChain"],
      tags: ["AI / LLM", "機器人 / Bot", "Python", "Flask", "Gemini", "Azure", "LangChain"],
      longDesc: '這門課程的作業整合了 9 個 AI 聊天機器人和微型應用程式專案，讓我對不同 AI 服務的整合有了深入理解。專案包含：<ul><li><strong>LLM_Chatbot</strong>：使用 Google Gemini API 建立的網頁版聊天機器人，具備安全設定 and 對話功能。</li><li><strong>LLM_Line</strong>：整合 Gemini API 的 Line Bot，提供智能對話服務。</li><li><strong>LangChain</strong>：基於 LangChain 框架開發的 AI 應用程式。</li><li><strong>SentimentAnalysis</strong>：使用 Microsoft Language Service 進行情感分析，判斷文字的正向、負向或中性情緒。</li><li><strong>TextToSpeech</strong>：整合 Azure Translation 和 Speech Services 的 Line Bot，提供文字翻譯和語音合成功能。</li><li><strong>TranslatorBot</strong>：使用 Azure Translation Service 的多語言翻譯服務。</li><li><strong>TranslatorBot(+voice)</strong>：進階版翻譯機器人，支援語音輸入和語音輸出。</li><li><strong>TranslatorWeb</strong>：基於 Flask 的網頁翻譯應用程式，整合 Azure 翻譯和語音服務。</li><li><strong>GeminiSafetySetting</strong>：展示 Google Gemini API 的安全設定範例。</li></ul>技術棧使用 Python 開發，整合 Flask 框架、Google Gemini API、Microsoft Azure Cognitive Services、LangChain，以及 Line Messaging API。',
      tech: '微型應用程式設計實務 ｜ Line Bot, Flask, Gemini, Azure, LangChain',
      image: './assets/img/portfolio/1131_Chatbot.png',
      github: 'https://github.com/tsz7250/undergrad-archive/tree/main/1131_Chatbot'
    },
    {
      id: '1121_LinearAlgebra',
      title: '1121 - 線性代數',
      category: 'academic',
      badge: '學校專案 · 作業',
      date: '2024-01',
      topics: ["演算法 / 數學", "桌面應用"],
      techStack: ["C#", "C++", "LINGO"],
      tags: ["演算法 / 數學", "桌面應用", "C#", "C++", "LINGO"],
      longDesc: '這門課程的作業展示了線性代數在實際程式設計中的應用，包含 4 個專案：<ul><li><strong>ILP 專案</strong>：使用 C++ 生成整數線性規劃問題，並使用 LINGO 軟體解決圖形二分割問題，學習如何將實際問題轉化為數學模型。</li><li><strong>Measurement 專案</strong>：使用 C# 開發幾何測量系統，實作向量運算、矩陣轉換等線性代數概念，應用於幾何計算和測量。</li><li><strong>LightsOutGame 專案</strong>：使用 C# 實作點燈遊戲，運用線性代數來解決遊戲邏輯，理解如何用矩陣運算來處理遊戲狀態。</li><li><strong>RREF 專案</strong>：使用 C++ 實作簡化階梯形矩陣計算器，可以處理任意大小的矩陣並進行高斯消去法運算，實現線性方程組求解。</li></ul>這些專案涵蓋了矩陣運算和線性方程組求解、幾何計算和測量、整數線性規劃建模等核心概念，讓我理解到線性代數不只是抽象的數學概念，更是解決實際問題的重要工具。',
      tech: '線性代數 ｜ C#, C++, LINGO',
      image: './assets/img/portfolio/1121_LinearAlgebra.png',
      github: 'https://github.com/tsz7250/undergrad-archive/tree/main/1121_LinearAlgebra'
    },
    {
      id: '1122_HDL',
      title: '1122 - 數位系統實驗（二）',
      category: 'academic',
      badge: '學校專案 · 作業',
      date: '2024-05',
      topics: ["硬體系統 / 電路", "數位實驗"],
      techStack: ["VHDL", "FPGA", "Quartus"],
      tags: ["硬體系統 / 電路", "數位實驗", "VHDL", "FPGA", "Quartus"],
      longDesc: '這門課程透過 15 個實驗專案，讓我深入理解數位電路的設計與實作。專案涵蓋了從基礎到進階的各種數位電路：<ul><li><strong>Lab 04</strong>：使用 SOP/POS 方法實作布林函數，並實作八對三編碼器。</li><li><strong>Lab 05</strong>：設計基本組合邏輯電路與進階組合電路。</li><li><strong>Lab 06</strong>：實作 Moore machine 二進制編碼狀態機與序列偵測器 FSM。</li><li><strong>Lab 07</strong>：設計算數邏輯運算單元 (ALU)。</li><li><strong>Lab 08</strong>：實作移位暫存器與同步計數器。</li><li><strong>Lab 09</strong>：設計非同步清除同步載入的 60 模計數器。</li><li><strong>Lab 10-12</strong>：實作 LED 控制器、PWM 呼吸燈（自動調節 LED 亮度）、跑馬燈（LED 週期性位移電路）。</li><li><strong>Lab 13-14</strong>：設計七段顯示器計時器與 0-99 計數器。</li><li><strong>Lab 15</strong>：實作紅綠燈控制與倒數計時器。</li></ul>每個實驗都需要使用 VHDL 語言來描述電路行為，使用 Intel Quartus Prime 進行編譯，使用 ModelSim 執行 testbench 進行功能驗證，並在 FPGA 開發板上驗證功能。這個課程讓我對硬體描述語言、數位系統設計流程、狀態機設計、時序電路設計，以及硬體與軟體的差異有了深刻的理解。',
      tech: '數位系統實驗（二） ｜ VHDL',
      image: './assets/img/portfolio/1122_HDL.png',
      github: 'https://github.com/tsz7250/undergrad-archive/tree/main/1122_HDL'
    },
    {
      id: '1122_WebsiteProgrammingPractice',
      title: '1122 - 網站程式設計實務',
      category: 'academic',
      badge: '學校專案 · 作業',
      date: '2024-05',
      topics: ["網頁應用", "資料視覺化", "AI / LLM"],
      techStack: ["Python", "Flask", "JavaScript", "Plotly.js", "Gemini"],
      tags: ["網頁應用", "資料視覺化", "AI / LLM", "Python", "Flask", "JavaScript", "Plotly.js", "Gemini"],
      longDesc: '這門課程的作業涵蓋了多個 Web 開發的實務練習，包含 15 個專案，讓我對完整的前後端開發有了全面的理解：<ul><li><strong>基礎前端開發</strong>：HelloJavaScript（JavaScript 基礎測試）和 ClubCourse（JavaScript 自動排課系統）。</li><li><strong>資料視覺化專案</strong>：HelloPlotly（Plotly.js 基礎測試）、PieChart（圓餅圖製作）、LineAndScatter（折線圖與散點圖）、以及 JPYExchange（日圓匯率即時視覺化，使用 Plotly.js 繪製動態圖表並實作自動更新機制）。</li><li><strong>互動式應用</strong>：MindQuiz（JavaScript 心理測驗純前端版本）、MindQuiz_py（Python Flask 心理測驗後端版本）、RandomSelector（亂數選擇器）、以及 SimCardCalulator（SIM卡購買天數計算器）。</li><li><strong>遊戲開發</strong>：SimpleRPG（JavaScript RPG 小遊戲，練習物件導向程式設計與遊戲邏輯）和 SimpleRPG+LLM（結合 LLM 的 RPG 遊戲）。</li><li><strong>AI 應用</strong>：Chatbot（使用 Flask 整合 LLM API 開發聊天機器人，學習如何處理非同步請求與串流回應）、HelloLangChain（Google Gemini API 實作）、以及 LLMPhoto（LLM 圖片理解服務）。</li></ul>技術棧使用 HTML/CSS/JavaScript 處理前端，Python Flask 處理後端，整合 Plotly.js 進行資料視覺化，以及 Google Gemini API 和 LangChain 進行 AI 應用開發。每個專案都強調前後端的整合，讓我理解到現代 Web 開發的完整流程。',
      tech: '網站程式設計實務 ｜ Flask, JavaScript, Plotly.js',
      image: './assets/img/portfolio/1122_WebsiteProgrammingPractice.png',
      github: 'https://github.com/tsz7250/undergrad-archive/tree/main/1122_WebsiteProgrammingPractice'
    },
    {
      id: '1122_AssemblyLanguage',
      title: '1122 - 組合語言與計算機組織',
      category: 'academic',
      badge: '學校專案 · 作業',
      date: '2024-04',
      topics: ["底層系統", "演算法 / 數學"],
      techStack: ["RISC-V", "Assembly"],
      tags: ["底層系統", "演算法 / 數學", "RISC-V", "Assembly"],
      longDesc: '這門課程讓我深入理解底層計算機運作原理，透過 RISC-V 組合語言實作 3 個程式：<ul><li><strong>Combination & Permutation 專案</strong>：實作組合與排列數計算程式，包括計算 mPn（排列）、mCn（組合）、m^n（次方）、以及 mHn（重複組合），學習如何用組合語言實作階乘、排列、組合等數學運算，以及遞迴函數的組合語言實作。</li><li><strong>Nameology of the Five Elements 專案</strong>：實作五格姓名學分析程式，處理字串輸入並進行複雜的數值計算，包括輸入姓名筆劃數、計算三才五格數值等功能，練習了字串處理與迴圈控制。</li><li><strong>Steiner Trees 專案</strong>：實作史坦納樹演算法，學習如何用組合語言處理圖形演算法，包括計算圖形中的最小史坦納樹、支援座標點輸入與輸出等功能，理解了如何在低階語言中實作複雜的演算法。</li></ul>每個專案都需要仔細管理暫存器、記憶體位置，以及函數呼叫的堆疊操作，使用 RISC-V Assembly Language 編寫源碼（.asm 檔案）。開發過程中，我必須手動管理暫存器、理解指令管線化、以及處理記憶體存取。',
      tech: '組合語言與計算機組織 ｜ RISC-V Assembly',
      image: './assets/img/portfolio/1122_AssemblyLanguage.png',
      github: 'https://github.com/tsz7250/undergrad-archive/tree/main/1122_AssemblyLanguage'
    },
    {
      id: '1112_ComputerProgramming',
      title: '1112 - 程式設計二',
      category: 'academic',
      badge: '學校專案 · 作業',
      date: '2023-06',
      topics: ["軟體工程", "演算法 / 數學"],
      techStack: ["C++", "OOP"],
      tags: ["軟體工程", "演算法 / 數學", "C++", "OOP"],
      longDesc: '這門課程專注於 C++ 物件導向程式設計，透過 5 個專案讓我扎實掌握 OOP 的核心概念：<ul><li><strong>BigFib 專案</strong>：實作大數運算的費波那契數列，練習遞迴與迭代的實作，以及大數運算的處理。</li><li><strong>CipherMachine 專案</strong>：實作字串處理與編碼機器，學習字元處理與檔案 I/O 操作。</li><li><strong>Graph 專案</strong>：實作圖形容器設計與路徑演算法，包括實作深度優先搜尋 (DFS) 與廣度優先搜尋 (BFS)，以及圖論與生成樹演算法。</li><li><strong>PokerDealer 專案</strong>：實作撲克牌發牌系統，練習類別設計與繼承，學習如何設計良好的物件導向架構。</li><li><strong>Quadrilaterals 專案</strong>：實作四邊形類別設計與點座標系統，深入理解虛擬函數、抽象類別與多型的概念，學習如何設計可擴展的類別層次結構。</li></ul>每個專案都強調良好的程式設計習慣，包括類別封裝、介面設計、以及程式碼重用。這些練習為我後續的軟體開發奠定了堅實的基礎。',
      tech: '程式設計二 ｜ C++',
      image: './assets/img/portfolio/1112_ComputerProgramming.png',
      github: 'https://github.com/tsz7250/undergrad-archive/tree/main/1112_ComputerProgramming'
    },
    {
      id: '1111_WebProgramming',
      title: '1111 - Web 程式設計',
      category: 'academic',
      badge: '學校專案 · 作業',
      date: '2022-11',
      topics: ["網頁應用", "資料視覺化"],
      techStack: ["PHP", "MySQL", "JavaScript", "Google Charts"],
      tags: ["網頁應用", "資料視覺化", "PHP", "MySQL", "JavaScript", "Google Charts"],
      longDesc: '這是我第一門 Web 程式設計課程，透過多個作業讓我對基礎的 Web 開發技術有了完整的理解：<ul><li><strong>Captcha 專案</strong>：實作智能驗證碼系統，使用圖片分類驗證用戶身份，包含 IP 封鎖功能，學習如何產生圖形驗證碼並驗證使用者輸入，理解 Session 管理與安全性考量。</li><li><strong>LineChart 專案</strong>：使用 Google Charts API 製作互動式折線圖，支援 CSV 資料匯入 and 處理，學習如何將資料視覺化，以及如何處理不同格式的資料檔案。</li><li><strong>Querying 專案</strong>：實作多格式資料查詢系統，支援 CSV、XML 和 URL 資料來源的篩選 and 查詢，練習讀取與解析 CSV、XML 格式的檔案，並將資料存入資料庫，實作複雜的 SQL 查詢與前端篩選功能。</li></ul>技術棧包含 HTML 結構設計、CSS 樣式美化、JavaScript 互動處理、PHP 後端邏輯、以及 MySQL 資料庫操作。',
      tech: 'Web 程式設計 ｜ HTML, PHP, JavaScript, Google Charts, MySQL',
      image: './assets/img/portfolio/1111_WebProgramming.png',
      github: 'https://github.com/tsz7250/undergrad-archive/tree/main/1111_WebProgramming'
    },
    {
      id: '1142_AI-assistedSoftwareDevelopment',
      title: '1142 - 人工智慧輔助軟體開發',
      category: 'academic',
      badge: '學校專案 · 作業',
      date: '2025-06',
      topics: ["軟體工程", "DevOps", "AI / LLM"],
      techStack: ["C++", "Docker", "GTest", "CI/CD", "CMake"],
      tags: ["軟體工程", "DevOps", "AI / LLM", "C++", "Docker", "GTest", "CI/CD", "CMake"],
      longDesc: '這門課程探討如何應用先進的人工智慧技術輔助軟體開發生命週期，包括需求分析、系統設計、測試計畫、自動化 CI/CD 以及容器化部署。專案包含：<ul><li><strong>Project0 - Two Sum</strong>：演算法專案。實作陣列排序與哈希表兩種方法，並進行複雜度分析與 GTest 驗證，設定 Docker 與 GitHub Actions CI。</li><li><strong>ProjectB - CSV Mini Database & Query Engine</strong>：輕量級 CSV 資料庫與查詢引擎。支援高效 CSV 解析（使用 csv-parser）、記憶體雜湊索引，並提供類 SQL 的複合條件（AND, OR）查詢引擎。</li></ul>透過這些專案實作，我深入實踐了軟體工程最佳實務，包含演算法設計與時間複雜度分析、記憶體索引與複合查詢引擎設計、vcpkg 套件管理整合、自動化測試與 CI/CD 流程、Docker 容器化打包部署，以及軟體需求、設計與測試規格書的撰寫。',
      tech: '人工智慧輔助軟體開發 ｜ C++ 20, GTest, Docker, GitHub Actions, CMake',
      image: './assets/img/portfolio/1142_AI-assistedSoftwareDevelopment.png',
      github: 'https://github.com/tsz7250/undergrad-archive/tree/main/1142_AI-assistedSoftwareDevelopment'
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

  // Card click -> open modal (event delegation on #trip-cards-list)
  if (cardsList) {
    cardsList.addEventListener('click', (event) => {
      // 若點擊 GitHub 按鈕，直接跳轉，不打開 Modal
      if (event.target.closest && event.target.closest('.trip-card__btn-github')) {
        return;
      }
      const card = event.target.closest('.trip-card');
      if (card) {
        const id = card.dataset.projectId;
        if (id) {
          lastFocusedCard = card;
          openProjectModal(id);
        }
      }
    });
  }

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
