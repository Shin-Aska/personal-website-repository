/**
 * Project Showcase - Modern View Modes
 * Supports: Original (Table), Card Grid, and Shuffle Carousel views
 */

(function() {
  'use strict';

  // Project data extracted from the HTML
  let projectsData = [];

  // State
  let currentMode = 'card';
  let currentShuffleIndex = 0;
  let shuffleInterval = null;

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

  function detectStatusColor(statusAbbr, status) {
    const style = ((statusAbbr && statusAbbr.getAttribute('style')) || '').toLowerCase();
    if (style.includes('green')) return 'green';
    if (style.includes('purple')) return 'purple';
    if (style.includes('red')) return 'red';

    const normalizedStatus = (status || '').toLowerCase();
    if (normalizedStatus === 'active') return 'green';
    if (normalizedStatus === 'completed') return 'purple';
    return 'red';
  }

  function parseProjectsDataFromDom() {
    const source = document.getElementById('projects-source');
    if (!source) return [];

    const typesById = new Map();
    const legacyIds = new Set();

    const table = source.querySelector('table.projectsTable');
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

    const projectsRoot = source.querySelector('#projects');
    if (!projectsRoot) return [];

    const projects = [];
    Array.from(projectsRoot.children).forEach(section => {
      if (!section || section.tagName !== 'DIV' || !section.id) return;

      const id = section.id;
      const h3 = section.querySelector(':scope > h3');
      const img = section.querySelector(':scope > img');
      const statusAbbr = section.querySelector(':scope > p abbr');
      const status = statusAbbr ? normalizeWhitespace(statusAbbr.textContent) : '';
      const statusColor = detectStatusColor(statusAbbr, status);

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

      projects.push({
        id,
        name,
        type: typesById.get(id) || '',
        image,
        description,
        status,
        statusColor,
        legacy: legacyIds.has(id),
        links,
        details
      });
    });

    return projects;
  }

  /**
   * Initialize the project showcase
   */
  function initProjectShowcase() {
    const container = document.getElementById('projects-showcase');
    if (!container) return;

    projectsData = parseProjectsDataFromDom();
    if (!projectsData.length) return;

    // Create mode selector
    createModeSelector(container);

    // Create content container
    const contentDiv = document.createElement('div');
    contentDiv.id = 'projects-content';
    contentDiv.className = 'projects-content';
    container.appendChild(contentDiv);

    // Initial render
    renderMode('card');

    // Check for URL hash
    handleUrlHash();

    // Listen for hash changes
    window.addEventListener('hashchange', handleUrlHash);
  }

  /**
   * Create the mode selector buttons
   */
  function createModeSelector(container) {
    const selectorDiv = document.createElement('div');
    selectorDiv.className = 'view-mode-selector';
    selectorDiv.innerHTML = `
      <button class="view-mode-btn active" data-mode="card" title="Card Grid">
        ${icons.grid}
        <span>Cards</span>
      </button>
      <button class="view-mode-btn" data-mode="shuffle" title="Shuffle Carousel">
        ${icons.shuffle}
        <span>Shuffle</span>
      </button>
      <button class="view-mode-btn" data-mode="original" title="List View">
        ${icons.list}
        <span>List</span>
      </button>
    `;

    selectorDiv.querySelectorAll('.view-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        setMode(mode);
      });
    });

    container.insertBefore(selectorDiv, container.firstChild);
  }

  /**
   * Set the current view mode
   */
  function setMode(mode) {
    if (mode === currentMode) return;

    // Update buttons
    document.querySelectorAll('.view-mode-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    // Clear shuffle interval if leaving shuffle mode
    if (currentMode === 'shuffle' && shuffleInterval) {
      clearInterval(shuffleInterval);
      shuffleInterval = null;
    }

    if (currentMode === 'card') closeCardModal();

    currentMode = mode;
    renderMode(mode);
  }

  /**
   * Render the appropriate mode
   */
  function renderMode(mode) {
    const contentDiv = document.getElementById('projects-content');
    if (!contentDiv) return;

    const sourceDiv = document.getElementById('projects-source');

    if (mode === 'original') {
      if (sourceDiv) sourceDiv.style.display = '';
      contentDiv.style.display = 'none';
      contentDiv.innerHTML = '';
      return;
    }

    if (sourceDiv) sourceDiv.style.display = 'none';
    contentDiv.style.display = '';

    contentDiv.className = `projects-showcase mode-${mode}`;
    contentDiv.innerHTML = '';

    switch (mode) {
      case 'original':
        break;
      case 'card':
        renderCardMode(contentDiv);
        break;
      case 'shuffle':
        renderShuffleMode(contentDiv);
        break;
    }
  }

  /**
   * Render Original (List/Table) Mode
   */
  function renderOriginalMode(container) {
    // Create table
    const table = document.createElement('table');
    table.className = 'projects-list-table';
    table.innerHTML = `
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
        </tr>
      </thead>
      <tbody>
        ${projectsData.filter(p => !p.legacy).map(p => `
          <tr data-project="${p.id}">
            <td><a href="#${p.id}">${p.name}</a></td>
            <td>${p.type}</td>
          </tr>
        `).join('')}
        <tr class="legacy-row">
          <td colspan="2">--- Legacy / Archived ---</td>
        </tr>
        ${projectsData.filter(p => p.legacy).map(p => `
          <tr data-project="${p.id}">
            <td><a href="#${p.id}">${p.name}</a></td>
            <td>${p.type}</td>
          </tr>
        `).join('')}
      </tbody>
    `;

    // Add click handlers
    table.querySelectorAll('tr[data-project]').forEach(row => {
      row.addEventListener('click', (e) => {
        if (e.target.tagName !== 'A') {
          const projectId = row.dataset.project;
          showOriginalProjectDetail(projectId);
        }
      });
    });

    container.appendChild(table);

    // Detail container
    const detailDiv = document.createElement('div');
    detailDiv.id = 'original-project-detail';
    detailDiv.innerHTML = `
      <div class="project-detail" style="text-align: center; padding: 40px;">
        <h3>Select a project</h3>
        <p>Click on any project in the table above to see details.</p>
      </div>
    `;
    container.appendChild(detailDiv);
  }

  /**
   * Show project detail in original mode
   */
  function showOriginalProjectDetail(projectId) {
    const project = projectsData.find(p => p.id === projectId);
    if (!project) return;

    const detailDiv = document.getElementById('original-project-detail');
    if (!detailDiv) return;

    const linksHtml = project.links.map(l => `<a href="${l.url}" target="_blank">(${l.label})</a>`).join(' ');
    const statusColor = project.statusColor === 'green' ? '#4ade80' : 
                       project.statusColor === 'purple' ? '#a78bfa' : '#f87171';

    detailDiv.innerHTML = `
      <div class="project-detail">
        <h3>${project.name} ${linksHtml}</h3>
        <img src="${project.image}" alt="${project.name}" class="preview center" loading="lazy">
        <div>${project.details}</div>
        <p style="text-align: center; margin-top: 20px;">
          Status: <span class="status" style="color: ${statusColor}">${project.status}</span>
        </p>
      </div>
    `;

    // Scroll to detail
    detailDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /**
   * Render Card Grid Mode
   */
  function renderCardMode(container) {
    const grid = document.createElement('div');
    grid.className = 'projects-grid';

    projectsData.forEach(project => {
      const statusClass = project.status === 'Active' || project.status === 'Completed' 
        ? 'status-active' : 'status-hiatus';
      const linksHtml = project.links.map(l => 
        `<a href="${l.url}" target="_blank" onclick="event.stopPropagation()">${l.label}</a>`
      ).join(' ');

      const card = document.createElement('div');
      card.className = 'project-card';
      card.innerHTML = `
        <img src="${project.image}" alt="${project.name}" class="project-card-image" loading="lazy">
        <div class="project-card-content">
          <div class="project-card-header">
            <h3 class="project-card-title">${project.name}</h3>
            <span class="project-card-type">${project.type}</span>
          </div>
          <p class="project-card-desc">${project.description}</p>
          <div class="project-card-footer">
            <span class="project-card-status ${statusClass}">${project.status}</span>
            <div class="project-card-links">${linksHtml}</div>
          </div>
        </div>
      `;

      card.addEventListener('click', () => openCardModal(project));
      grid.appendChild(card);
    });

    container.appendChild(grid);

    // Create modal container
    if (!document.getElementById('card-modal-overlay')) {
      const modalOverlay = document.createElement('div');
      modalOverlay.id = 'card-modal-overlay';
      modalOverlay.className = 'card-modal-overlay';
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeCardModal();
      });
      document.body.appendChild(modalOverlay);
    }
  }

  /**
   * Open card modal
   */
  function openCardModal(project) {
    const overlay = document.getElementById('card-modal-overlay');
    if (!overlay) return;

    const linksHtml = project.links.map(l => 
      `<a href="${l.url}" target="_blank" style="color: var(--link-color);">${l.label}</a>`
    ).join(' | ');

    const statusColor = project.statusColor === 'green' ? '#4ade80' : 
                       project.statusColor === 'purple' ? '#a78bfa' : '#f87171';

    overlay.innerHTML = `
      <div class="card-modal">
        <div class="card-modal-header">
          <img src="${project.image}" alt="${project.name}" class="card-modal-image">
          <button class="card-modal-close" onclick="closeCardModal()">&times;</button>
        </div>
        <div class="card-modal-body">
          <span class="card-modal-type">${project.type}</span>
          <h2 class="card-modal-title">${project.name}</h2>
          <div class="card-modal-content">${project.details}</div>
          <div class="card-modal-footer">
            <span style="color: ${statusColor}; font-weight: 600;">Status: ${project.status}</span>
            <div>${linksHtml}</div>
          </div>
        </div>
      </div>
    `;

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  /**
   * Close card modal - exposed globally
   */
  window.closeCardModal = function() {
    const overlay = document.getElementById('card-modal-overlay');
    if (overlay) {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCardModal();
  });

  /**
   * Render Shuffle (Carousel) Mode
   */
  function renderShuffleMode(container) {
    container.classList.add('mode-shuffle');

    const shuffleContainer = document.createElement('div');
    shuffleContainer.className = 'shuffle-container';

    // Generate random angles for each card
    const angles = projectsData.map(() => (Math.random() * 40 - 20).toFixed(0));

    projectsData.forEach((project, index) => {
      const isActive = index === currentShuffleIndex;
      const statusColor = project.statusColor === 'green' ? '#4ade80' : 
                         project.statusColor === 'purple' ? '#a78bfa' : '#f87171';

      const card = document.createElement('div');
      card.className = `shuffle-card ${isActive ? 'active' : ''}`;
      card.dataset.index = index;
      card.style.setProperty('--shuffle-angle', `${angles[index]}deg`);

      const linksHtml = project.links.map(l => 
        `<a href="${l.url}" target="_blank" style="color: var(--link-color); font-size: 0.85rem;">(${l.label})</a>`
      ).join(' ');

      card.innerHTML = `
        <img src="${project.image}" alt="${project.name}" class="shuffle-card-image" loading="lazy">
        <div class="shuffle-card-data">
          <span class="shuffle-card-num">${index + 1} / ${projectsData.length}</span>
          <h2 class="shuffle-card-title">${project.name} ${linksHtml}</h2>
          <span class="shuffle-card-type">${project.type}</span>
          <p class="shuffle-card-desc">${project.description}</p>
          <p class="shuffle-card-status" style="color: ${statusColor}">Status: ${project.status}</p>
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
    projectsData.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = `shuffle-indicator ${index === currentShuffleIndex ? 'active' : ''}`;
      dot.dataset.index = index;
      dot.setAttribute('aria-label', `Go to project ${index + 1}`);
      dot.addEventListener('click', () => goToShuffleCard(index));
      indicators.appendChild(dot);
    });
    container.appendChild(indicators);

    // Add navigation handlers
    shuffleContainer.querySelectorAll('.shuffle-prev').forEach(btn => {
      btn.addEventListener('click', () => {
        const newIndex = (currentShuffleIndex - 1 + projectsData.length) % projectsData.length;
        goToShuffleCard(newIndex);
      });
    });

    shuffleContainer.querySelectorAll('.shuffle-next').forEach(btn => {
      btn.addEventListener('click', () => {
        const newIndex = (currentShuffleIndex + 1) % projectsData.length;
        goToShuffleCard(newIndex);
      });
    });

    // Keyboard navigation
    const keyHandler = (e) => {
      if (currentMode !== 'shuffle') {
        document.removeEventListener('keydown', keyHandler);
        return;
      }
      if (e.key === 'ArrowLeft') {
        const newIndex = (currentShuffleIndex - 1 + projectsData.length) % projectsData.length;
        goToShuffleCard(newIndex);
      } else if (e.key === 'ArrowRight') {
        const newIndex = (currentShuffleIndex + 1) % projectsData.length;
        goToShuffleCard(newIndex);
      }
    };
    document.addEventListener('keydown', keyHandler);

    // Auto-advance every 8 seconds
    if (shuffleInterval) clearInterval(shuffleInterval);
    shuffleInterval = setInterval(() => {
      if (currentMode === 'shuffle') {
        const newIndex = (currentShuffleIndex + 1) % projectsData.length;
        goToShuffleCard(newIndex);
      }
    }, 8000);
  }

  /**
   * Navigate to a specific shuffle card
   */
  function goToShuffleCard(index) {
    if (index === currentShuffleIndex) return;

    const cards = document.querySelectorAll('.shuffle-card');
    const indicators = document.querySelectorAll('.shuffle-indicator');

    // Update cards
    cards.forEach((card, i) => {
      card.classList.remove('active', 'prev', 'next', 'entering', 'leaving');

      if (i === index) {
        card.classList.add('active', 'entering');
      } else if (i === currentShuffleIndex) {
        card.classList.add('leaving');
      } else if (i === (index - 1 + projectsData.length) % projectsData.length) {
        card.classList.add('prev');
      } else if (i === (index + 1) % projectsData.length) {
        card.classList.add('next');
      }
    });

    // Update indicators
    indicators.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });

    currentShuffleIndex = index;
  }

  /**
   * Handle URL hash for direct linking
   */
  function handleUrlHash() {
    const hash = window.location.hash.slice(1);
    if (!hash) return;

    const project = projectsData.find(p => p.id === hash);
    if (!project) return;

    // If in original mode, show the project detail
    if (currentMode === 'original') {
      const target = document.getElementById(hash);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (currentMode === 'shuffle') {
      const index = projectsData.findIndex(p => p.id === hash);
      if (index !== -1) goToShuffleCard(index);
    } else if (currentMode === 'card') {
      openCardModal(project);
    }
  }

  // Expose init function globally
  window.initProjectShowcase = initProjectShowcase;

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProjectShowcase);
  } else {
    initProjectShowcase();
  }
})();
