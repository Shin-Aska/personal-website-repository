/**
 * Showcase - Generalized View Modes System
 * Supports: Card Grid, Shuffle Carousel, and List views
 * Used by: Projects, Blog, and Goodies pages
 */

(function () {
  'use strict';

  // Icon SVGs
  const icons = {
    list: '<svg viewBox="0 0 24 24"><path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z"/></svg>',
    grid: '<svg viewBox="0 0 24 24"><path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z"/></svg>',
    shuffle: '<svg viewBox="0 0 24 24"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>'
  };

  function normalizeWhitespace(str) {
    return (str || '').replace(/\s+/g, ' ').trim();
  }

  function cleanLinkLabel(label) {
    return normalizeWhitespace((label || '').replace(/[()]/g, ''));
  }

  /**
   * Showcase Class - Manages a single showcase instance
   */
  class Showcase {
    constructor(config) {
      this.config = Object.assign({
        containerId: 'showcase',
        sourceId: 'showcase-source',
        contentId: 'showcase-content',
        itemsId: 'items',
        tableClass: 'showcaseTable',
        type: 'generic', // 'projects', 'blog', 'goodies'
        defaultMode: 'card',
        enableSearch: true,
        enableModes: ['card', 'shuffle', 'original'],
        parseItem: null, // Custom parse function
        cardClickBehavior: 'modal', // 'modal', 'link', 'none'
        cardLinkAttribute: null, // e.g., 'data-url' for external links
      }, config);

      this.itemsData = [];
      this.filteredItemsData = [];
      this.currentRenderItemsData = [];
      this.currentMode = this.config.defaultMode;
      this.currentShuffleIndex = 0;
      this.shuffleInterval = null;
      this.shuffleKeyHandler = null;
      this.currentSearchQuery = '';
    }

    // Initialize the showcase
    init() {
      const container = document.getElementById(this.config.containerId);
      if (!container) return;

      this.itemsData = this.parseItemsDataFromDom();
      if (!this.itemsData.length) return;

      this.updateFilteredItems();
      this.applyListFilter();

      // Create mode selector
      this.createModeSelector(container);

      // Create search bar
      if (this.config.enableSearch) {
        this.createSearchBar(container);
      }

      // Create content container
      const contentDiv = document.createElement('div');
      contentDiv.id = this.config.contentId;
      contentDiv.className = 'showcase-content';
      container.appendChild(contentDiv);

      // Initial render
      this.renderMode(this.config.defaultMode);

      // Check for URL hash
      this.handleUrlHash();

      // Listen for hash changes
      window.addEventListener('hashchange', () => this.handleUrlHash());
    }

    // Parse items from DOM - can be overridden by config.parseItem
    parseItemsDataFromDom() {
      const source = document.getElementById(this.config.sourceId);
      if (!source) return [];

      if (this.config.parseItem) {
        return this.config.parseItem(source, this.config);
      }

      // Default parsing based on type
      switch (this.config.type) {
        case 'blog':
          return this.parseBlogItems(source);
        case 'goodies':
          return this.parseGoodiesItems(source);
        case 'projects':
        default:
          return this.parseProjectItems(source);
      }
    }

    // Parse blog items from blog-articles table
    // Table structure: <thead><tr><th>Date</th><th>Article Name</th><th>Description</th></tr></thead>
    //                  <tbody><tr><td>date</td><td><a href="...">title</a></td><td><p>desc</p></td></tr></tbody>
    parseBlogItems(source) {
      const items = [];

      // Look for the blog-articles table
      const table = source.querySelector('#blog-articles') || source.querySelector('table.' + this.config.tableClass);
      if (!table) return items;

      // Image base path
      const imageBasePath = this.config.imageBasePath || 'images/blogs/';

      // Parse table rows from tbody
      const tbody = table.querySelector('tbody');
      const rows = tbody ? tbody.querySelectorAll('tr') : table.querySelectorAll('tr');

      rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length < 2) return; // Skip header rows or malformed rows

        // Column 0: Date
        const dateCell = cells[0];
        const date = dateCell ? normalizeWhitespace(dateCell.textContent) : '';

        // Column 1: Article Name with link
        const nameCell = cells[1];
        const link = nameCell ? nameCell.querySelector('a') : null;
        const name = link ? normalizeWhitespace(link.textContent) : (nameCell ? normalizeWhitespace(nameCell.textContent) : '');
        const url = link ? (link.getAttribute('href') || '') : '';

        // Column 2: Description (optional - may contain <p> or direct text)
        const descCell = cells[2];
        let description = '';
        if (descCell) {
          // Get text content, normalizing whitespace
          description = normalizeWhitespace(descCell.textContent);
        }

        // Generate ID from URL or name
        let id = '';
        if (url) {
          id = url.replace(/\.html?$/i, '').replace(/[^a-zA-Z0-9_-]/g, '_');
        } else {
          id = name.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '_');
        }

        // Derive image from article URL filename
        // e.g., "starcraft2_fix.html" -> "images/blogs/starcraft2_fix.png"
        let image = '';
        if (url) {
          const filename = url.replace(/\.html?$/i, '');
          image = imageBasePath + filename + '.png';
        }

        const searchText = normalizeWhitespace([name, description, date].join(' ')).toLowerCase();

        items.push({
          id,
          name,
          type: 'Article',
          image,
          description,
          date,
          dateValue: date, // Use date directly as ISO format
          url,
          status: '',
          statusColor: '',
          legacy: false,
          links: url ? [{ label: 'Read Article', url }] : [],
          details: description,
          searchText,
          category: ''
        });
      });

      // Sort by date descending
      items.sort((a, b) => (b.dateValue || '').localeCompare(a.dateValue || ''));

      return items;
    }


    // Parse goodies items from games-list and utility-list tables
    // games-list: Name, Platform, Genre, Link (with <ul class="game-links">)
    // utility-list: Name, Type, Link (with <ul class="utility-links">)
    parseGoodiesItems(source) {
      const items = [];

      // Image base path
      const imageBasePath = this.config.imageBasePath || 'images/goodies/';

      // Image mapping for items that don't follow id.jpg pattern
      const imageMap = {
        'warzone 2100': 'warzone_2100.jpg',
        '0 a.d': 'zero_ad.jpg',
        '0 a.d.': 'zero_ad.jpg',
        'super tux kart': 'supertuxkart.png',
        'super tux': 'supertux.png',
        'openredalert': 'openra.png',
        'battle for wesnoth': 'battle_for_wesnoth.jpg',
        'handwritten letter recognition': 'handwritten_recognition.png',
        'image similarity finder': 'image_similarity.png',
        'video summarizer': 'video_summarizer.png',
        'introduction to image processing to a statistician': 'intro-to-stat.jpg',
        'customized programming language': 'custom_lang.jpg'

      };

      // Parse games table
      const gamesTable = source.querySelector('#games-list');
      if (gamesTable) {
        const tbody = gamesTable.querySelector('tbody');
        const rows = tbody ? tbody.querySelectorAll('tr') : gamesTable.querySelectorAll('tr');

        rows.forEach(row => {
          const cells = row.querySelectorAll('td');
          if (cells.length < 4) return; // Skip header rows

          const name = normalizeWhitespace(cells[0].textContent);
          const platform = normalizeWhitespace(cells[1].textContent);
          const genre = normalizeWhitespace(cells[2].textContent);

          // Get links from the ul.game-links
          const linksCell = cells[3];
          const links = Array.from(linksCell.querySelectorAll('a')).map(a => ({
            label: normalizeWhitespace(a.textContent),
            url: a.getAttribute('href') || ''
          }));

          // Generate ID from name
          const id = name.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '_');

          // Derive image from name
          const nameLower = name.toLowerCase();
          let image = '';
          if (imageMap[nameLower]) {
            image = imageBasePath + imageMap[nameLower];
          } else {
            image = imageBasePath + id + '.jpg';
          }

          // Build details HTML
          let detailsHtml = '';
          if (platform) detailsHtml += `<p><strong>Platform:</strong> ${platform}</p>`;
          if (genre) detailsHtml += `<p><strong>Genre:</strong> ${genre}</p>`;
          if (links.length) {
            detailsHtml += '<p><strong>Downloads:</strong></p><ul>';
            links.forEach(l => {
              detailsHtml += `<li><a href="${l.url}" target="_blank">${l.label}</a></li>`;
            });
            detailsHtml += '</ul>';
          }

          const searchText = normalizeWhitespace([name, platform, genre, 'games'].join(' ')).toLowerCase();

          items.push({
            id,
            name,
            type: genre || 'Game',
            image,
            description: '',
            date: '',
            dateValue: '',
            url: '',
            status: '',
            statusColor: '',
            legacy: false,
            links,
            details: detailsHtml,
            searchText,
            category: 'games',
            platform,
            genre
          });
        });
      }

      // Parse utilities table
      const utilityTable = source.querySelector('#utility-list');
      if (utilityTable) {
        const tbody = utilityTable.querySelector('tbody');
        const rows = tbody ? tbody.querySelectorAll('tr') : utilityTable.querySelectorAll('tr');

        rows.forEach(row => {
          const cells = row.querySelectorAll('td');
          if (cells.length < 3) return; // Skip header rows

          const name = normalizeWhitespace(cells[0].textContent);
          const type = normalizeWhitespace(cells[1].textContent);

          // Get links from the ul.utility-links
          const linksCell = cells[2];
          const links = Array.from(linksCell.querySelectorAll('a')).map(a => ({
            label: normalizeWhitespace(a.textContent),
            url: a.getAttribute('href') || ''
          }));

          // Generate ID from name
          const id = name.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '_');

          // Derive image from name
          const nameLower = name.toLowerCase();
          let image = '';
          if (imageMap[nameLower]) {
            image = imageBasePath + imageMap[nameLower];
          } else {
            image = imageBasePath + id + '.png';
          }

          // Build details HTML
          let detailsHtml = '';
          if (type) detailsHtml += `<p><strong>Type:</strong> ${type}</p>`;
          if (links.length) {
            detailsHtml += '<p><strong>Downloads:</strong></p><ul>';
            links.forEach(l => {
              detailsHtml += `<li><a href="${l.url}" target="_blank">${l.label}</a></li>`;
            });
            detailsHtml += '</ul>';
          }

          const searchText = normalizeWhitespace([name, type, 'utilities'].join(' ')).toLowerCase();

          items.push({
            id,
            name,
            type: type || 'Utility',
            image,
            description: '',
            date: '',
            dateValue: '',
            url: '',
            status: '',
            statusColor: '',
            legacy: false,
            links,
            details: detailsHtml,
            searchText,
            category: 'utilities',
            platform: type,
            genre: ''
          });
        });
      }

      return items;
    }


    // Parse project items (original implementation)
    parseProjectItems(source) {
      const typesById = new Map();
      const legacyIds = new Set();

      const table = source.querySelector('table.' + this.config.tableClass);
      if (table) {
        let isLegacy = false;
        table.querySelectorAll('tr').forEach(row => {
          if (row.id === 'legacy-button') {
            isLegacy = true;
            return;
          }

          const link = row.querySelector('a[href^="#"]');
          const cells = row.querySelectorAll('td');
          if (!link || cells.length < 2) return;

          const id = link.getAttribute('href').slice(1);
          const type = normalizeWhitespace(cells[1].textContent);

          if (id) {
            typesById.set(id, type);
            if (isLegacy) legacyIds.add(id);
          }
        });
      }

      const itemsRoot = source.querySelector('#' + this.config.itemsId);
      if (!itemsRoot) return [];

      const items = [];
      Array.from(itemsRoot.children).forEach(section => {
        if (!section || section.tagName !== 'DIV' || !section.id) return;

        const id = section.id;
        const h3 = section.querySelector(':scope > h3');
        const img = section.querySelector(':scope > img');
        const statusAbbr = section.querySelector(':scope > p abbr');
        const status = statusAbbr ? normalizeWhitespace(statusAbbr.textContent) : '';
        const statusColor = this.detectStatusColor(statusAbbr, status);

        let name = '';
        if (h3) {
          for (const node of h3.childNodes) {
            if (node.nodeType === Node.TEXT_NODE && normalizeWhitespace(node.textContent)) {
              name = normalizeWhitespace(node.textContent);
              break;
            }
          }
          if (!name) name = normalizeWhitespace(h3.textContent);
        }

        const links = h3
          ? Array.from(h3.querySelectorAll('a')).map(a => ({
            label: cleanLinkLabel(a.textContent),
            url: a.getAttribute('href') || ''
          }))
          : [];

        const image = img ? (img.getAttribute('src') || '') : '';

        const descriptionP = Array.from(section.querySelectorAll(':scope > p')).find(p => !p.querySelector('abbr'));
        const description = descriptionP ? normalizeWhitespace(descriptionP.textContent) : '';

        const clone = section.cloneNode(true);
        const cloneH3 = clone.querySelector(':scope > h3');
        if (cloneH3) cloneH3.remove();
        const cloneImg = clone.querySelector(':scope > img');
        if (cloneImg) cloneImg.remove();
        clone.querySelectorAll('hr').forEach(hr => hr.remove());
        clone.querySelectorAll('p').forEach(p => {
          if (p.querySelector('abbr') || /^\s*Status\s*:/i.test(p.textContent)) p.remove();
        });

        const details = normalizeWhitespace(clone.innerHTML) ? clone.innerHTML.trim() : '';
        const detailsText = normalizeWhitespace(clone.textContent);
        const searchText = normalizeWhitespace([
          name,
          typesById.get(id) || '',
          status,
          description,
          detailsText
        ].join(' ')).toLowerCase();

        items.push({
          id,
          name,
          type: typesById.get(id) || '',
          image,
          description,
          status,
          statusColor,
          legacy: legacyIds.has(id),
          links,
          details,
          searchText,
          date: '',
          dateValue: '',
          url: '',
          category: ''
        });
      });

      return items;
    }

    detectStatusColor(statusAbbr, status) {
      const style = ((statusAbbr && statusAbbr.getAttribute('style')) || '').toLowerCase();
      if (style.includes('green')) return 'green';
      if (style.includes('purple')) return 'purple';
      if (style.includes('red')) return 'red';

      const normalizedStatus = (status || '').toLowerCase();
      if (normalizedStatus === 'active') return 'green';
      if (normalizedStatus === 'completed') return 'purple';
      return 'red';
    }

    updateFilteredItems() {
      const q = normalizeWhitespace(this.currentSearchQuery).toLowerCase();
      if (!q) {
        this.filteredItemsData = this.itemsData.slice();
        return;
      }

      this.filteredItemsData = this.itemsData.filter(p => {
        const haystack = p.searchText || '';
        return haystack.includes(q);
      });
    }

    ensureListNoResultsElement(sourceDiv) {
      if (!sourceDiv) return null;

      let el = document.getElementById(this.config.sourceId + '-no-results');
      if (!el) {
        el = document.createElement('div');
        el.id = this.config.sourceId + '-no-results';
        el.className = 'showcase-empty-message';
        el.textContent = 'No items found.';
        sourceDiv.insertBefore(el, sourceDiv.firstChild);
      }
      return el;
    }

    applyListFilter() {
      const sourceDiv = document.getElementById(this.config.sourceId);
      if (!sourceDiv) return;

      const visibleIds = new Set(this.filteredItemsData.map(p => p.id));
      const hasQuery = !!normalizeWhitespace(this.currentSearchQuery);

      const emptyEl = this.ensureListNoResultsElement(sourceDiv);
      if (emptyEl) {
        emptyEl.style.display = this.filteredItemsData.length ? 'none' : '';
      }

      const table = sourceDiv.querySelector('table.' + this.config.tableClass);
      let hasAnyVisibleRow = false;
      let hasAnyVisibleLegacyRow = false;

      if (table) {
        let isLegacy = false;
        table.querySelectorAll('tr').forEach(row => {
          if (row.querySelectorAll('th').length) {
            row.style.display = '';
            return;
          }

          if (row.id === 'legacy-button') {
            isLegacy = true;
            row.style.display = '';
            return;
          }

          const link = row.querySelector('a[href^="#"]');
          if (!link) {
            row.style.display = '';
            return;
          }

          const id = link.getAttribute('href').slice(1);
          const show = !hasQuery || visibleIds.has(id);
          row.style.display = show ? '' : 'none';

          if (show) {
            hasAnyVisibleRow = true;
            if (isLegacy) hasAnyVisibleLegacyRow = true;
          }
        });

        const legacyRow = table.querySelector('#legacy-button');
        if (legacyRow) {
          legacyRow.style.display = (!hasQuery || hasAnyVisibleLegacyRow) ? '' : 'none';
        }
      }

      const itemsRoot = sourceDiv.querySelector('#' + this.config.itemsId);
      if (itemsRoot) {
        itemsRoot.querySelectorAll(':scope > div[id]').forEach(section => {
          const show = !hasQuery || visibleIds.has(section.id);
          section.style.display = show ? '' : 'none';
          if (show) hasAnyVisibleRow = true;
        });

        const legacyHeading = itemsRoot.querySelector(':scope > h3');
        if (legacyHeading) {
          legacyHeading.style.display = (!hasQuery || hasAnyVisibleLegacyRow) ? '' : 'none';
        }

        const legacyBreak = itemsRoot.querySelector(':scope > br');
        if (legacyBreak) {
          legacyBreak.style.display = (!hasQuery || hasAnyVisibleLegacyRow) ? '' : 'none';
        }
      }

      if (emptyEl) {
        emptyEl.style.display = (!hasQuery || hasAnyVisibleRow) ? 'none' : '';
      }
    }

    setSearchQuery(query) {
      const normalized = normalizeWhitespace(query);
      if (normalized === this.currentSearchQuery) return;

      this.currentSearchQuery = normalized;
      this.updateFilteredItems();
      this.applyListFilter();

      this.currentShuffleIndex = 0;

      if (this.currentMode === 'shuffle' && this.shuffleInterval) {
        clearInterval(this.shuffleInterval);
        this.shuffleInterval = null;
      }

      if (this.currentMode === 'shuffle' && this.shuffleKeyHandler) {
        document.removeEventListener('keydown', this.shuffleKeyHandler);
        this.shuffleKeyHandler = null;
      }

      this.closeCardModal();
      this.renderMode(this.currentMode);
    }

    createSearchBar(container) {
      const searchDiv = document.createElement('div');
      searchDiv.className = 'showcase-search-bar';
      searchDiv.innerHTML = `
        <input id="${this.config.containerId}-search-input" class="showcase-search-input" type="search" placeholder="Search..." autocomplete="off" aria-label="Search">
        <button id="${this.config.containerId}-search-clear" class="showcase-search-clear" type="button" aria-label="Clear search">Clear</button>
      `;

      const input = searchDiv.querySelector('input');
      const clearBtn = searchDiv.querySelector('button');

      if (input) {
        input.value = this.currentSearchQuery;
        input.addEventListener('input', () => this.setSearchQuery(input.value));
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
            input.value = '';
            this.setSearchQuery('');
          }
        });
      }

      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          if (input) input.value = '';
          this.setSearchQuery('');
          if (input) input.focus();
        });
      }

      const selector = container.querySelector('.view-mode-selector');
      if (selector && selector.parentNode) {
        selector.parentNode.insertBefore(searchDiv, selector.nextSibling);
      } else {
        container.insertBefore(searchDiv, container.firstChild);
      }
    }

    createModeSelector(container) {
      const selectorDiv = document.createElement('div');
      selectorDiv.className = 'view-mode-selector';

      let buttonsHtml = '';
      if (this.config.enableModes.includes('card')) {
        buttonsHtml += `
          <button class="view-mode-btn ${this.config.defaultMode === 'card' ? 'active' : ''}" data-mode="card" title="Card Grid">
            ${icons.grid}
            <span>Cards</span>
          </button>
        `;
      }
      if (this.config.enableModes.includes('shuffle')) {
        buttonsHtml += `
          <button class="view-mode-btn ${this.config.defaultMode === 'shuffle' ? 'active' : ''}" data-mode="shuffle" title="Shuffle Carousel">
            ${icons.shuffle}
            <span>Shuffle</span>
          </button>
        `;
      }
      if (this.config.enableModes.includes('original')) {
        buttonsHtml += `
          <button class="view-mode-btn ${this.config.defaultMode === 'original' ? 'active' : ''}" data-mode="original" title="List View">
            ${icons.list}
            <span>List</span>
          </button>
        `;
      }

      selectorDiv.innerHTML = buttonsHtml;

      selectorDiv.querySelectorAll('.view-mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const mode = btn.dataset.mode;
          this.setMode(mode);
        });
      });

      container.insertBefore(selectorDiv, container.firstChild);
    }

    setMode(mode) {
      if (mode === this.currentMode) return;

      // Update buttons
      document.querySelectorAll(`#${this.config.containerId} .view-mode-btn`).forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
      });

      // Clear shuffle interval if leaving shuffle mode
      if (this.currentMode === 'shuffle' && this.shuffleInterval) {
        clearInterval(this.shuffleInterval);
        this.shuffleInterval = null;
      }

      if (this.currentMode === 'shuffle' && this.shuffleKeyHandler) {
        document.removeEventListener('keydown', this.shuffleKeyHandler);
        this.shuffleKeyHandler = null;
      }

      if (this.currentMode === 'card') this.closeCardModal();

      this.currentMode = mode;
      this.renderMode(mode);
    }

    renderMode(mode) {
      const contentDiv = document.getElementById(this.config.contentId);
      if (!contentDiv) return;

      const sourceDiv = document.getElementById(this.config.sourceId);

      if (mode === 'original') {
        if (sourceDiv) sourceDiv.style.display = '';
        contentDiv.style.display = 'none';
        contentDiv.innerHTML = '';
        this.applyListFilter();
        return;
      }

      if (sourceDiv) sourceDiv.style.display = 'none';
      contentDiv.style.display = '';

      contentDiv.className = `showcase-content mode-${mode}`;
      contentDiv.innerHTML = '';

      this.currentRenderItemsData = this.filteredItemsData.slice();

      if (mode === 'shuffle' && !this.currentRenderItemsData.length) {
        if (this.shuffleInterval) {
          clearInterval(this.shuffleInterval);
          this.shuffleInterval = null;
        }
        if (this.shuffleKeyHandler) {
          document.removeEventListener('keydown', this.shuffleKeyHandler);
          this.shuffleKeyHandler = null;
        }
      }

      if (!this.currentRenderItemsData.length) {
        const empty = document.createElement('div');
        empty.className = 'showcase-empty-message';
        empty.textContent = 'No items found.';
        contentDiv.appendChild(empty);
        return;
      }

      switch (mode) {
        case 'card':
          this.renderCardMode(contentDiv, this.currentRenderItemsData);
          break;
        case 'shuffle':
          this.renderShuffleMode(contentDiv, this.currentRenderItemsData);
          break;
      }
    }

    renderCardMode(container, renderItems) {
      const grid = document.createElement('div');
      grid.className = 'showcase-grid';

      renderItems.forEach(item => {
        const statusClass = item.status === 'Active' || item.status === 'Completed'
          ? 'status-active' : item.status ? 'status-hiatus' : '';

        // Build links HTML
        let linksHtml = '';
        if (this.config.type === 'blog' && item.url) {
          linksHtml = `<a href="${item.url}" onclick="event.stopPropagation()">Read More</a>`;
        } else {
          linksHtml = item.links.map(l =>
            `<a href="${l.url}" target="_blank" onclick="event.stopPropagation()">${l.label}</a>`
          ).join(' ');
        }

        // Build meta info (date for blog, status for projects)
        let metaHtml = '';
        if (this.config.type === 'blog' && item.date) {
          metaHtml = `<span class="showcase-card-date">${item.date}</span>`;
        } else if (item.status) {
          metaHtml = `<span class="showcase-card-status ${statusClass}">${item.status}</span>`;
        }

        const card = document.createElement('div');
        card.className = 'showcase-card';
        card.innerHTML = `
          <img src="${item.image}" alt="${item.name}" class="showcase-card-image" loading="lazy">
          <div class="showcase-card-content">
            <div class="showcase-card-header">
              <h3 class="showcase-card-title">${item.name}</h3>
              <span class="showcase-card-type">${item.type}</span>
            </div>
            <p class="showcase-card-desc">${item.description}</p>
            <div class="showcase-card-footer">
              ${metaHtml}
              <div class="showcase-card-links">${linksHtml}</div>
            </div>
          </div>
        `;

        // Handle card click behavior
        if (this.config.cardClickBehavior === 'link' && item.url) {
          card.addEventListener('click', (e) => {
            if (e.target.tagName !== 'A') {
              window.location.href = item.url;
            }
          });
        } else if (this.config.cardClickBehavior === 'modal') {
          card.addEventListener('click', () => this.openCardModal(item));
        }

        grid.appendChild(card);
      });

      container.appendChild(grid);

      // Create modal container if needed
      const modalId = this.config.containerId + '-modal-overlay';
      if (!document.getElementById(modalId)) {
        const modalOverlay = document.createElement('div');
        modalOverlay.id = modalId;
        modalOverlay.className = 'card-modal-overlay';
        modalOverlay.addEventListener('click', (e) => {
          if (e.target === modalOverlay) this.closeCardModal();
        });
        document.body.appendChild(modalOverlay);
      }
    }

    openCardModal(item) {
      const modalId = this.config.containerId + '-modal-overlay';
      const overlay = document.getElementById(modalId);
      if (!overlay) return;

      // Build links HTML
      let linksHtml = '';
      if (this.config.type === 'blog' && item.url) {
        linksHtml = `<a href="${item.url}" style="color: var(--link-color);">Read Full Article</a>`;
      } else {
        linksHtml = item.links.map(l =>
          `<a href="${l.url}" target="_blank" style="color: var(--link-color);">${l.label}</a>`
        ).join(' | ');
      }

      // Build meta info
      let metaHtml = '';
      if (this.config.type === 'blog' && item.date) {
        metaHtml = `<span style="font-weight: 600;">Published: ${item.date}</span>`;
      } else if (item.status) {
        const statusColor = item.statusColor === 'green' ? '#4ade80' :
          item.statusColor === 'purple' ? '#a78bfa' : '#f87171';
        metaHtml = `<span style="color: ${statusColor}; font-weight: 600;">Status: ${item.status}</span>`;
      }

      overlay.innerHTML = `
        <div class="card-modal">
          <div class="card-modal-header">
            <img src="${item.image}" alt="${item.name}" class="card-modal-image">
            <button class="card-modal-close" aria-label="Close">&times;</button>
          </div>
          <div class="card-modal-body">
            <span class="card-modal-type">${item.type}</span>
            <h2 class="card-modal-title">${item.name}</h2>
            <div class="card-modal-content">${item.details || item.description}</div>
            <div class="card-modal-footer">
              ${metaHtml}
              <div>${linksHtml}</div>
            </div>
          </div>
        </div>
      `;

      // Add close button handler
      const closeBtn = overlay.querySelector('.card-modal-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.closeCardModal());
      }

      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';

      // Close on Escape key
      const escHandler = (e) => {
        if (e.key === 'Escape') {
          this.closeCardModal();
          document.removeEventListener('keydown', escHandler);
        }
      };
      document.addEventListener('keydown', escHandler);
    }

    closeCardModal() {
      const modalId = this.config.containerId + '-modal-overlay';
      const overlay = document.getElementById(modalId);
      if (overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    }

    renderShuffleMode(container, renderItems) {
      container.classList.add('mode-shuffle');

      if (this.shuffleKeyHandler) {
        document.removeEventListener('keydown', this.shuffleKeyHandler);
        this.shuffleKeyHandler = null;
      }

      if (this.shuffleInterval) {
        clearInterval(this.shuffleInterval);
        this.shuffleInterval = null;
      }

      const shuffleContainer = document.createElement('div');
      shuffleContainer.className = 'shuffle-container';

      // Generate random angles for each card
      const angles = renderItems.map(() => (Math.random() * 40 - 20).toFixed(0));

      renderItems.forEach((item, index) => {
        const isActive = index === this.currentShuffleIndex;
        const statusColor = item.statusColor === 'green' ? '#4ade80' :
          item.statusColor === 'purple' ? '#a78bfa' : '#f87171';

        const card = document.createElement('div');
        card.className = `shuffle-card ${isActive ? 'active' : ''}`;
        card.dataset.index = index;
        card.style.setProperty('--shuffle-angle', `${angles[index]}deg`);

        // Build links or date
        let metaHtml = '';
        if (this.config.type === 'blog') {
          if (item.date) metaHtml = `<p class="shuffle-card-date">${item.date}</p>`;
          if (item.url) metaHtml += `<a href="${item.url}" class="shuffle-card-link">Read Article →</a>`;
        } else if (item.status) {
          metaHtml = `<p class="shuffle-card-status" style="color: ${statusColor}">Status: ${item.status}</p>`;
        }

        const linksHtml = item.links.map(l =>
          `<a href="${l.url}" target="_blank" style="color: var(--link-color); font-size: 0.85rem;">(${l.label})</a>`
        ).join(' ');

        card.innerHTML = `
          <img src="${item.image}" alt="${item.name}" class="shuffle-card-image" loading="lazy">
          <div class="shuffle-card-data">
            <span class="shuffle-card-num">${index + 1} / ${renderItems.length}</span>
            <h2 class="shuffle-card-title">${item.name} ${this.config.type !== 'blog' ? linksHtml : ''}</h2>
            <span class="shuffle-card-type">${item.type}</span>
            <p class="shuffle-card-desc">${item.description}</p>
            ${metaHtml}
            <div class="shuffle-card-nav">
              <button class="shuffle-nav-btn shuffle-prev" data-index="${index}" aria-label="Previous">&#10094;</button>
              <button class="shuffle-nav-btn shuffle-next" data-index="${index}" aria-label="Next">&#10095;</button>
            </div>
          </div>
        `;

        shuffleContainer.appendChild(card);
      });

      container.appendChild(shuffleContainer);

      // Indicators
      const indicators = document.createElement('div');
      indicators.className = 'shuffle-indicators';
      renderItems.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.className = `shuffle-indicator ${index === this.currentShuffleIndex ? 'active' : ''}`;
        dot.dataset.index = index;
        dot.setAttribute('aria-label', `Go to item ${index + 1}`);
        dot.addEventListener('click', () => this.goToShuffleCard(index));
        indicators.appendChild(dot);
      });
      container.appendChild(indicators);

      // Add navigation handlers
      shuffleContainer.querySelectorAll('.shuffle-prev').forEach(btn => {
        btn.addEventListener('click', () => {
          const len = this.currentRenderItemsData.length;
          const newIndex = (this.currentShuffleIndex - 1 + len) % len;
          this.goToShuffleCard(newIndex);
        });
      });

      shuffleContainer.querySelectorAll('.shuffle-next').forEach(btn => {
        btn.addEventListener('click', () => {
          const len = this.currentRenderItemsData.length;
          const newIndex = (this.currentShuffleIndex + 1) % len;
          this.goToShuffleCard(newIndex);
        });
      });

      // Keyboard navigation
      this.shuffleKeyHandler = (e) => {
        if (this.currentMode !== 'shuffle') {
          document.removeEventListener('keydown', this.shuffleKeyHandler);
          this.shuffleKeyHandler = null;
          return;
        }
        if (e.key === 'ArrowLeft') {
          const len = this.currentRenderItemsData.length;
          const newIndex = (this.currentShuffleIndex - 1 + len) % len;
          this.goToShuffleCard(newIndex);
        } else if (e.key === 'ArrowRight') {
          const len = this.currentRenderItemsData.length;
          const newIndex = (this.currentShuffleIndex + 1) % len;
          this.goToShuffleCard(newIndex);
        }
      };
      document.addEventListener('keydown', this.shuffleKeyHandler);

      // Auto-advance every 8 seconds
      this.shuffleInterval = setInterval(() => {
        if (this.currentMode === 'shuffle') {
          const len = this.currentRenderItemsData.length;
          const newIndex = (this.currentShuffleIndex + 1) % len;
          this.goToShuffleCard(newIndex);
        }
      }, 8000);
    }

    goToShuffleCard(index) {
      if (index === this.currentShuffleIndex) return;

      const len = this.currentRenderItemsData.length;
      if (!len) return;
      if (index < 0 || index >= len) return;

      const container = document.getElementById(this.config.contentId);
      if (!container) return;

      const cards = container.querySelectorAll('.shuffle-card');
      const indicators = container.querySelectorAll('.shuffle-indicator');

      // Update cards
      cards.forEach((card, i) => {
        card.classList.remove('active', 'prev', 'next', 'entering', 'leaving');

        if (i === index) {
          card.classList.add('active', 'entering');
        } else if (i === this.currentShuffleIndex) {
          card.classList.add('leaving');
        } else if (i === (index - 1 + len) % len) {
          card.classList.add('prev');
        } else if (i === (index + 1) % len) {
          card.classList.add('next');
        }
      });

      // Update indicators
      indicators.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });

      this.currentShuffleIndex = index;
    }

    handleUrlHash() {
      const hash = window.location.hash.slice(1);
      if (!hash) return;

      const item = this.itemsData.find(p => p.id === hash);
      if (!item) return;

      if (this.currentSearchQuery) {
        const existsInFiltered = this.filteredItemsData.some(p => p.id === hash);
        if (!existsInFiltered) this.setSearchQuery('');
      }

      // If in original mode, scroll to the item
      if (this.currentMode === 'original') {
        const target = document.getElementById(hash);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (this.currentMode === 'shuffle') {
        const index = this.currentRenderItemsData.findIndex(p => p.id === hash);
        if (index !== -1) this.goToShuffleCard(index);
      } else if (this.currentMode === 'card') {
        const filteredItem = this.filteredItemsData.find(p => p.id === hash);
        if (filteredItem) this.openCardModal(filteredItem);
      }
    }
  }

  // Expose Showcase class globally
  window.Showcase = Showcase;

  // Also expose backward-compatible init for projects
  window.initProjectShowcase = function () {
    const showcase = new Showcase({
      containerId: 'projects-showcase',
      sourceId: 'projects-source',
      contentId: 'projects-content',
      itemsId: 'projects',
      tableClass: 'projectsTable',
      type: 'projects',
      defaultMode: 'card',
      cardClickBehavior: 'modal'
    });
    showcase.init();
  };

  // Auto-initialize project showcase if container exists
  function autoInit() {
    if (document.getElementById('projects-showcase')) {
      window.initProjectShowcase();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }
})();
