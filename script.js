/* ============================================================
   GreenStock AI — Inventory Management Dashboard
   Vanilla JavaScript Application Logic
   ============================================================ */

// ============================================================
// STATE
// ============================================================
let products = [];
let activities = [];
let settings = {
  defaultMinStock: 10,
  currency: 'USD',
  darkMode: false,
};
let currentPage = 'dashboard';
let editingProductId = null;
let deletingProductId = null;
let chartRange = 7;
let overviewChartCtx = null;
let healthChartCtx = null;
let categoryChartCtx = null;

const CURRENCY_SYMBOLS = {
  USD: '$',
  PKR: '₨',
  EUR: '€',
  GBP: '£',
};

// ============================================================
// DEMO DATA
// ============================================================
const DEMO_PRODUCTS = [
  { id: 'p1', name: 'Laptop Pro 15', sku: 'LAP-001', category: 'Electronics', price: 1299, stock: 20, minStock: 10, supplier: 'TechSource Ltd', description: '15-inch professional laptop with 16GB RAM', salesHistory: [20, 25, 30, 28, 35, 32, 40] },
  { id: 'p2', name: 'Wireless Mouse', sku: 'MSE-002', category: 'Electronics', price: 29, stock: 5, minStock: 15, supplier: 'TechSource Ltd', description: 'Ergonomic wireless mouse', salesHistory: [45, 50, 48, 52, 55, 50, 58] },
  { id: 'p3', name: 'Mechanical Keyboard', sku: 'KEY-003', category: 'Electronics', price: 89, stock: 12, minStock: 8, supplier: 'KeyMfg Co', description: 'RGB mechanical keyboard with blue switches', salesHistory: [15, 18, 20, 22, 19, 25, 28] },
  { id: 'p4', name: '24-inch Monitor', sku: 'MON-004', category: 'Electronics', price: 199, stock: 8, minStock: 5, supplier: 'DisplayWorks', description: 'Full HD IPS monitor', salesHistory: [10, 12, 8, 14, 11, 13, 15] },
  { id: 'p5', name: 'Office Chair', sku: 'CHR-005', category: 'Furniture', price: 249, stock: 30, minStock: 10, supplier: 'FurniturePlus', description: 'Ergonomic office chair with lumbar support', salesHistory: [8, 10, 12, 9, 11, 14, 13] },
  { id: 'p6', name: 'Desk Lamp', sku: 'LMP-006', category: 'Furniture', price: 39, stock: 0, minStock: 10, supplier: 'FurniturePlus', description: 'LED desk lamp with adjustable brightness', salesHistory: [20, 22, 18, 25, 20, 24, 26] },
  { id: 'p7', name: 'USB-C Hub', sku: 'HUB-007', category: 'Electronics', price: 49, stock: 25, minStock: 12, supplier: 'TechSource Ltd', description: '7-in-1 USB-C hub with HDMI', salesHistory: [30, 35, 32, 38, 40, 36, 42] },
  { id: 'p8', name: 'External SSD 1TB', sku: 'SSD-008', category: 'Electronics', price: 129, stock: 3, minStock: 8, supplier: 'StorageTech', description: 'Portable 1TB USB-C SSD', salesHistory: [12, 15, 14, 18, 16, 20, 22] },
  { id: 'p9', name: 'Webcam HD', sku: 'CAM-009', category: 'Electronics', price: 69, stock: 18, minStock: 8, supplier: 'DisplayWorks', description: '1080p HD webcam with autofocus', salesHistory: [18, 20, 22, 19, 24, 26, 25] },
  { id: 'p10', name: 'Bluetooth Headphones', sku: 'AUD-010', category: 'Electronics', price: 99, stock: 15, minStock: 10, supplier: 'AudioMax', description: 'Noise-cancelling Bluetooth headphones', salesHistory: [25, 28, 30, 27, 32, 35, 33] },
  { id: 'p11', name: 'Cotton T-Shirt', sku: 'TSH-011', category: 'Clothing', price: 19, stock: 100, minStock: 30, supplier: 'ApparelCo', description: 'Premium cotton crew neck t-shirt', salesHistory: [50, 55, 48, 60, 52, 58, 62] },
  { id: 'p12', name: 'Organic Coffee Beans', sku: 'CFF-012', category: 'Food', price: 14, stock: 45, minStock: 20, supplier: 'BeanRoasters', description: '1lb bag of organic medium roast coffee', salesHistory: [40, 45, 42, 50, 48, 52, 55] },
];

const DEMO_ACTIVITIES = [
  { id: 'a1', action: 'add', product: 'Laptop Pro 15', quantity: 20, timestamp: Date.now() - 2 * 3600000 },
  { id: 'a2', action: 'sell', product: 'Laptop Pro 15', quantity: 5, timestamp: Date.now() - 4 * 3600000 },
  { id: 'a3', action: 'update', product: 'Wireless Mouse', quantity: 0, timestamp: Date.now() - 26 * 3600000 },
  { id: 'a4', action: 'low_alert', product: 'Mechanical Keyboard', quantity: 0, timestamp: Date.now() - 28 * 3600000 },
  { id: 'a5', action: 'add', product: 'Monitor', quantity: 10, timestamp: Date.now() - 48 * 3600000 },
];

// ============================================================
// INITIALIZATION
// ============================================================
function initializeApp() {
  loadFromStorage();
  applyTheme();
  setupEventListeners();
  renderAll();
  updateTopbarTitle();
}

function renderAll() {
  renderDashboard();
  renderProducts();
  renderInventory();
  renderAlerts();
  renderPrediction();
  renderActivity();
  renderSettings();
  updateLowStockBadge();
}

// ============================================================
// LOCAL STORAGE
// ============================================================
function loadFromStorage() {
  try {
    const savedProducts = localStorage.getItem('stockpilot_products');
    const savedActivities = localStorage.getItem('stockpilot_activities');
    const savedSettings = localStorage.getItem('stockpilot_settings');

    products = savedProducts ? JSON.parse(savedProducts) : [...DEMO_PRODUCTS];
    activities = savedActivities ? JSON.parse(savedActivities) : [...DEMO_ACTIVITIES];
    settings = savedSettings ? JSON.parse(savedSettings) : { defaultMinStock: 10, currency: 'USD', darkMode: false };

    if (!savedProducts) saveProducts();
    if (!savedActivities) saveActivities();
    if (!savedSettings) saveSettings();
  } catch (e) {
    products = [...DEMO_PRODUCTS];
    activities = [...DEMO_ACTIVITIES];
    settings = { defaultMinStock: 10, currency: 'USD', darkMode: false };
  }
}

function saveProducts() {
  localStorage.setItem('stockpilot_products', JSON.stringify(products));
}

function saveActivities() {
  localStorage.setItem('stockpilot_activities', JSON.stringify(activities));
}

function saveSettings() {
  localStorage.setItem('stockpilot_settings', JSON.stringify(settings));
}

// ============================================================
// EVENT LISTENERS
// ============================================================
function setupEventListeners() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(item.dataset.page);
    });
  });

  document.getElementById('hamburger').addEventListener('click', toggleSidebar);
  document.getElementById('sidebarClose').addEventListener('click', closeSidebar);
  document.getElementById('sidebarOverlay').addEventListener('click', closeSidebar);

  document.getElementById('themeToggle').addEventListener('click', toggleDarkMode);

  document.getElementById('askAiBtn').addEventListener('click', openAiDrawer);
  document.getElementById('aiDrawerClose').addEventListener('click', closeAiDrawer);

  document.getElementById('aiChatSend').addEventListener('click', () => {
    const input = document.getElementById('aiChatInput');
    if (input.value.trim()) askAI(input.value.trim());
  });
  document.getElementById('aiChatInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const input = e.target;
      if (input.value.trim()) askAI(input.value.trim());
    }
  });

  document.querySelectorAll('.chart-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.chart-toggle').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      chartRange = parseInt(btn.dataset.range);
      drawOverviewChart();
    });
  });

  document.getElementById('productSearch').addEventListener('input', renderProducts);
  document.getElementById('filterCategory').addEventListener('change', renderProducts);
  document.getElementById('filterStatus').addEventListener('change', renderProducts);
  document.getElementById('sortBy').addEventListener('change', renderProducts);

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('show');
      }
    });
  });
}

// ============================================================
// NAVIGATION
// ============================================================
function navigateTo(page) {
  currentPage = page;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const pageEl = document.getElementById('page-' + page);
  if (pageEl) pageEl.classList.add('active');

  const navEl = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (navEl) navEl.classList.add('active');

  updateTopbarTitle();
  closeSidebar();

  if (page === 'prediction') renderPrediction();
  if (page === 'dashboard') {
    setTimeout(() => {
      drawOverviewChart();
      drawHealthChart();
      drawCategoryChart();
    }, 50);
  }
}

function updateTopbarTitle() {
  const titles = {
    dashboard: 'Inventory Dashboard',
    products: 'Product Management',
    inventory: 'Inventory Management',
    lowstock: 'Low Stock Alerts',
    prediction: 'AI Demand Prediction',
    activity: 'Activity Log',
    settings: 'Settings',
  };
  document.getElementById('topbarTitle').textContent = titles[currentPage] || 'GreenStock AI';
}

// ============================================================
// SIDEBAR (MOBILE)
// ============================================================
function toggleSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sidebarOverlay').classList.add('show');
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('show');
}

// ============================================================
// DARK MODE
// ============================================================
function toggleDarkMode() {
  settings.darkMode = !settings.darkMode;
  applyTheme();
  saveSettings();
  updateThemeButton();
  setTimeout(() => {
    drawOverviewChart();
    drawHealthChart();
    drawCategoryChart();
    if (currentPage === 'prediction') renderPrediction();
  }, 50);
}

function applyTheme() {
  document.documentElement.setAttribute('data-theme', settings.darkMode ? 'dark' : 'light');
  updateThemeButton();
}

function updateThemeButton() {
  const btn = document.getElementById('settingThemeBtn');
  if (btn) {
    btn.innerHTML = settings.darkMode ? '☀️ Light Mode' : '🌙 Dark Mode';
  }
}

// ============================================================
// STOCK STATUS LOGIC
// ============================================================
function getStockStatus(product) {
  if (product.stock === 0) return 'out';
  if (product.stock <= product.minStock) return 'low';
  return 'in';
}

function getStatusBadge(status) {
  const badges = {
    in: '<span class="status-badge status-in">🟢 In Stock</span>',
    low: '<span class="status-badge status-low">🟠 Low Stock</span>',
    out: '<span class="status-badge status-out">🔴 Out of Stock</span>',
  };
  return badges[status] || badges.in;
}

// ============================================================
// DASHBOARD
// ============================================================
function renderDashboard() {
  const stats = calculateInventoryStats();

  animateCounter('statTotalProducts', stats.totalProducts);
  animateCounter('statCurrentStock', stats.currentStock);
  animateCounter('statLowStock', stats.lowStock);
  animateCounter('statOutStock', stats.outStock);

  document.getElementById('inventoryValue').textContent = formatCurrency(stats.inventoryValue);

  renderRecentActivity();
  renderHealthBreakdown(stats);

  setTimeout(() => {
    drawOverviewChart();
    drawHealthChart();
    drawCategoryChart();
  }, 50);
}

function calculateInventoryStats() {
  const totalProducts = products.length;
  const currentStock = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= p.minStock).length;
  const outStock = products.filter(p => p.stock === 0).length;
  const inventoryValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);

  return { totalProducts, currentStock, lowStock, outStock, inventoryValue };
}

function renderRecentActivity() {
  const container = document.getElementById('recentActivity');
  const recent = activities.slice(0, 5);
  if (recent.length === 0) {
    container.innerHTML = '<div class="empty-state" style="padding:30px;"><p>No recent activity.</p></div>';
    return;
  }
  container.innerHTML = recent.map(a => `
    <div class="activity-item">
      <div class="activity-icon ${getActivityIconClass(a.action)}">${getActivityIcon(a.action)}</div>
      <div class="activity-info">
        <div class="activity-text">${formatActivityText(a)}</div>
        <div class="activity-time">${formatTime(a.timestamp)}</div>
      </div>
    </div>
  `).join('');
}

function renderHealthBreakdown(stats) {
  const total = stats.totalProducts || 1;
  const healthy = products.filter(p => p.stock > p.minStock).length;
  const low = stats.lowStock;
  const out = stats.outStock;

  const healthyPct = Math.round((healthy / total) * 100);
  const lowPct = Math.round((low / total) * 100);
  const outPct = Math.round((out / total) * 100);

  const container = document.getElementById('healthBreakdown');
  container.innerHTML = `
    <div class="health-bar-item">
      <span class="health-bar-label">Healthy</span>
      <div class="health-bar-track"><div class="health-bar-fill" style="width:${healthyPct}%;background:var(--green-500);"></div></div>
      <span class="health-bar-percent">${healthyPct}%</span>
    </div>
    <div class="health-bar-item">
      <span class="health-bar-label">Low Stock</span>
      <div class="health-bar-track"><div class="health-bar-fill" style="width:${lowPct}%;background:var(--orange-500);"></div></div>
      <span class="health-bar-percent">${lowPct}%</span>
    </div>
    <div class="health-bar-item">
      <span class="health-bar-label">Out of Stock</span>
      <div class="health-bar-track"><div class="health-bar-fill" style="width:${outPct}%;background:var(--red-500);"></div></div>
      <span class="health-bar-percent">${outPct}%</span>
    </div>
  `;
}

function calculateInventoryHealth() {
  const stats = calculateInventoryStats();
  if (stats.totalProducts === 0) return 0;

  const healthy = products.filter(p => p.stock > p.minStock).length;
  const healthyRatio = healthy / stats.totalProducts;
  const lowPenalty = stats.lowStock / stats.totalProducts * 0.5;
  const outPenalty = stats.outStock / stats.totalProducts;

  let score = (healthyRatio * 100) - (lowPenalty * 50) - (outPenalty * 30);
  score = Math.max(0, Math.min(100, Math.round(score)));
  return score;
}

// ============================================================
// CHARTS (Canvas API)
// ============================================================
function getChartColors() {
  const isDark = settings.darkMode;
  return {
    text: isDark ? '#94a3b8' : '#64748b',
    grid: isDark ? '#334155' : '#e2e8f0',
    stockIn: '#22c55e',
    stockOut: '#ef4444',
    current: '#22c55e',
    blue: '#16a34a',
    cyan: '#34d399',
    bg: isDark ? '#1e293b' : '#ffffff',
  };
}

function drawOverviewChart() {
  const canvas = document.getElementById('overviewChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const colors = getChartColors();

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = 300 * dpr;
  ctx.scale(dpr, dpr);
  const W = rect.width;
  const H = 300;

  ctx.clearRect(0, 0, W, H);

  const days = chartRange;
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartW = W - padding.left - padding.right;
  const chartH = H - padding.top - padding.bottom;

  const stockInData = generateChartData(days, 'in');
  const stockOutData = generateChartData(days, 'out');
  const currentData = generateChartData(days, 'current');

  const allValues = [...stockInData, ...stockOutData, ...currentData];
  const maxVal = Math.max(...allValues, 10);
  const niceMax = Math.ceil(maxVal / 10) * 10;

  ctx.strokeStyle = colors.grid;
  ctx.lineWidth = 1;
  ctx.font = '11px Inter, sans-serif';
  ctx.fillStyle = colors.text;

  const gridLines = 5;
  for (let i = 0; i <= gridLines; i++) {
    const y = padding.top + (chartH / gridLines) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(W - padding.right, y);
    ctx.stroke();
    const val = Math.round(niceMax - (niceMax / gridLines) * i);
    ctx.textAlign = 'right';
    ctx.fillText(val, padding.left - 8, y + 4);
  }

  const stepX = chartW / (days - 1);
  const xLabels = getXLabels(days);

  ctx.textAlign = 'center';
  const labelStep = Math.ceil(days / 7);
  for (let i = 0; i < days; i += labelStep) {
    const x = padding.left + stepX * i;
    ctx.fillText(xLabels[i], x, H - padding.bottom + 20);
  }

  drawLine(ctx, stockInData, padding, chartW, chartH, niceMax, days, colors.stockIn, true);
  drawLine(ctx, stockOutData, padding, chartW, chartH, niceMax, days, colors.stockOut, false);
  drawLine(ctx, currentData, padding, chartW, chartH, niceMax, days, colors.current, false);
}

function drawLine(ctx, data, padding, chartW, chartH, maxVal, days, color, fill) {
  const stepX = chartW / (days - 1);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.beginPath();

  data.forEach((val, i) => {
    const x = padding.left + stepX * i;
    const y = padding.top + chartH - (val / maxVal) * chartH;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  if (fill) {
    ctx.lineTo(padding.left + stepX * (days - 1), padding.top + chartH);
    ctx.lineTo(padding.left, padding.top + chartH);
    ctx.closePath();
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = color;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  ctx.fillStyle = color;
  data.forEach((val, i) => {
    const x = padding.left + stepX * i;
    const y = padding.top + chartH - (val / maxVal) * chartH;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
  });
}

function generateChartData(days, type) {
  const data = [];
  let base = type === 'current' ? 8400 : type === 'in' ? 80 : 60;
  for (let i = 0; i < days; i++) {
    const variance = (Math.sin(i * 0.5) + Math.cos(i * 0.3)) * 15;
    const trend = i * (type === 'current' ? -5 : 0.5);
    const noise = (Math.random() - 0.5) * 20;
    let val = Math.max(0, Math.round(base + variance + trend + noise));
    if (type === 'current') val = Math.max(100, val);
    data.push(val);
  }
  return data;
}

function getXLabels(days) {
  const labels = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    labels.push(`${d.getMonth() + 1}/${d.getDate()}`);
  }
  return labels;
}

function drawHealthChart() {
  const canvas = document.getElementById('healthChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const colors = getChartColors();
  const score = calculateInventoryHealth();

  const dpr = window.devicePixelRatio || 1;
  canvas.width = 200 * dpr;
  canvas.height = 200 * dpr;
  ctx.scale(dpr, dpr);
  const cx = 100, cy = 100, radius = 80, lineWidth = 14;

  ctx.clearRect(0, 0, 200, 200);

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.strokeStyle = colors.grid;
  ctx.lineWidth = lineWidth;
  ctx.stroke();

  const scoreColor = score >= 75 ? '#22c55e' : score >= 50 ? '#f97316' : '#ef4444';
  const endAngle = -Math.PI / 2 + (score / 100) * Math.PI * 2;

  ctx.beginPath();
  ctx.arc(cx, cy, radius, -Math.PI / 2, endAngle);
  ctx.strokeStyle = scoreColor;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.stroke();

  const scoreEl = document.getElementById('healthScore');
  if (scoreEl) animateCounter('healthScore', score, 800);
}

function drawCategoryChart() {
  const canvas = document.getElementById('categoryChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const colors = getChartColors();

  const dpr = window.devicePixelRatio || 1;
  canvas.width = 220 * dpr;
  canvas.height = 220 * dpr;
  ctx.scale(dpr, dpr);

  ctx.clearRect(0, 0, 220, 220);

  const categories = {};
  products.forEach(p => {
    categories[p.category] = (categories[p.category] || 0) + p.stock;
  });

  const total = Object.values(categories).reduce((s, v) => s + v, 0);
  if (total === 0) return;

  const palette = ['#16a34a', '#34d399', '#4ade80', '#f97316', '#a855f7', '#eab308'];
  const labels = Object.keys(categories);
  const values = Object.values(categories);

  let startAngle = -Math.PI / 2;
  const cx = 110, cy = 110, outerR = 90, innerR = 55;

  labels.forEach((label, i) => {
    const angle = (values[i] / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, startAngle, startAngle + angle);
    ctx.arc(cx, cy, innerR, startAngle + angle, startAngle, true);
    ctx.closePath();
    ctx.fillStyle = palette[i % palette.length];
    ctx.fill();
    startAngle += angle;
  });

  const legend = document.getElementById('categoryLegend');
  if (legend) {
    legend.innerHTML = labels.map((label, i) => {
      const pct = Math.round((values[i] / total) * 100);
      return `
        <div class="category-legend-item">
          <span class="category-legend-color" style="background:${palette[i % palette.length]}"></span>
          <span class="category-legend-name">${label}</span>
          <span class="category-legend-value">${pct}%</span>
        </div>
      `;
    }).join('');
  }
}

// ============================================================
// PRODUCTS PAGE
// ============================================================
function renderProducts() {
  const tbody = document.getElementById('productTableBody');
  const empty = document.getElementById('productsEmpty');
  const filtered = getFilteredProducts();

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  tbody.innerHTML = filtered.map(p => {
    const status = getStockStatus(p);
    return `
      <tr>
        <td>
          <div class="product-name-cell">${escapeHtml(p.name)}</div>
          <div class="product-sku-cell">${escapeHtml(p.description || '')}</div>
        </td>
        <td>${escapeHtml(p.sku)}</td>
        <td>${escapeHtml(p.category)}</td>
        <td>${formatCurrency(p.price)}</td>
        <td><strong>${p.stock}</strong></td>
        <td>${p.minStock}</td>
        <td>${getStatusBadge(status)}</td>
        <td>
          <div class="table-actions">
            <button class="action-btn action-edit" onclick="openProductModal('${p.id}')" title="Edit">✏️</button>
            <button class="action-btn action-delete" onclick="openDeleteModal('${p.id}')" title="Delete">🗑️</button>
            <button class="action-btn action-add" onclick="adjustStock('${p.id}', 1)" title="+ Stock">➕</button>
            <button class="action-btn action-remove" onclick="adjustStock('${p.id}', -1)" title="- Stock">➖</button>
            <button class="action-btn" onclick="openDetailsModal('${p.id}')" title="Details">👁️</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function getFilteredProducts() {
  const search = document.getElementById('productSearch')?.value.toLowerCase() || '';
  const category = document.getElementById('filterCategory')?.value || 'all';
  const status = document.getElementById('filterStatus')?.value || 'all';
  const sort = document.getElementById('sortBy')?.value || 'name-asc';

  let filtered = [...products];

  if (search) {
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(search) ||
      p.sku.toLowerCase().includes(search) ||
      p.category.toLowerCase().includes(search)
    );
  }

  if (category !== 'all') {
    filtered = filtered.filter(p => p.category === category);
  }

  if (status !== 'all') {
    filtered = filtered.filter(p => getStockStatus(p) === status);
  }

  switch (sort) {
    case 'name-asc': filtered.sort((a, b) => a.name.localeCompare(b.name)); break;
    case 'name-desc': filtered.sort((a, b) => b.name.localeCompare(a.name)); break;
    case 'stock-desc': filtered.sort((a, b) => b.stock - a.stock); break;
    case 'stock-asc': filtered.sort((a, b) => a.stock - b.stock); break;
    case 'price-desc': filtered.sort((a, b) => b.price - a.price); break;
    case 'price-asc': filtered.sort((a, b) => a.price - b.price); break;
  }

  return filtered;
}

// ============================================================
// INVENTORY PAGE
// ============================================================
function renderInventory() {
  const grid = document.getElementById('inventoryGrid');
  const empty = document.getElementById('inventoryEmpty');

  if (products.length === 0) {
    grid.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  grid.innerHTML = products.map(p => {
    const status = getStockStatus(p);
    const pct = Math.min(100, Math.round((p.stock / (p.minStock * 3 || 1)) * 100));
    const barColor = status === 'in' ? 'green' : status === 'low' ? 'orange' : 'red';
    return `
      <div class="inventory-item">
        <div class="inventory-item-header">
          <div>
            <div class="inventory-item-name">${escapeHtml(p.name)}</div>
            <div class="inventory-item-sku">${escapeHtml(p.sku)} · ${escapeHtml(p.category)}</div>
          </div>
          ${getStatusBadge(status)}
        </div>
        <div class="inventory-stock-control">
          <button class="stock-btn minus" onclick="adjustStock('${p.id}', -1)" ${p.stock === 0 ? 'disabled' : ''}>−</button>
          <div class="stock-display">
            <div class="stock-display-value">${p.stock}</div>
            <div class="stock-display-label">in stock</div>
          </div>
          <button class="stock-btn plus" onclick="adjustStock('${p.id}', 1)">+</button>
        </div>
        <div class="stock-progress">
          <div class="stock-progress-fill ${barColor}" style="width:${pct}%"></div>
        </div>
        <div class="inventory-item-footer">
          <span class="inventory-item-price">${formatCurrency(p.price)}</span>
          <span class="inventory-item-min">Min: ${p.minStock}</span>
        </div>
      </div>
    `;
  }).join('');
}

// ============================================================
// LOW STOCK ALERTS
// ============================================================
function renderAlerts() {
  const grid = document.getElementById('alertsGrid');
  const empty = document.getElementById('alertsEmpty');

  const alertProducts = products.filter(p => p.stock <= p.minStock);

  if (alertProducts.length === 0) {
    grid.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  grid.innerHTML = alertProducts.map(p => {
    const status = getStockStatus(p);
    const isOut = status === 'out';
    const isCritical = !isOut && p.stock <= Math.ceil(p.minStock / 2);

    const cardClass = isOut ? 'alert-out' : isCritical ? 'alert-critical' : '';
    const icon = isOut ? '🚨' : '⚠️';
    const title = isOut ? 'Out of Stock' : 'Low Stock';
    const detail = isOut
      ? `<strong>${escapeHtml(p.name)}</strong> — 0 units remaining.`
      : `<strong>${escapeHtml(p.name)}</strong> — only <strong>${p.stock} units</strong> remaining.`;
    const minInfo = isOut ? '' : `<div class="alert-detail">Minimum required: ${p.minStock} units</div>`;
    const action = isOut
      ? '<div class="alert-action alert-action-restock">Restock Required</div>'
      : '<div class="alert-action alert-action-reorder">Reorder Recommended</div>';

    return `
      <div class="alert-card ${cardClass}">
        <div class="alert-header">
          <span class="alert-icon">${icon}</span>
          <span class="alert-title">${title}</span>
        </div>
        <div class="alert-product">${detail}</div>
        ${minInfo}
        ${action}
      </div>
    `;
  }).join('');
}

function updateLowStockBadge() {
  const count = products.filter(p => p.stock <= p.minStock).length;
  const badge = document.getElementById('lowStockBadge');
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline-block' : 'none';
  }
}

// ============================================================
// DEMAND PREDICTION
// ============================================================
function renderPrediction() {
  const grid = document.getElementById('predictionGrid');
  if (!grid) return;

  if (products.length === 0) {
    grid.innerHTML = '<div class="empty-state"><div class="empty-icon">🔮</div><p>No products to analyze.</p></div>';
    return;
  }

  grid.innerHTML = products.map(p => {
    const prediction = calculateDemand(p);
    const recommendation = generateRecommendation(p, prediction);
    return `
      <div class="prediction-card">
        <div class="prediction-product-header">
          <div>
            <div class="prediction-product-name">${escapeHtml(p.name)}</div>
            <div class="prediction-product-sku">${escapeHtml(p.sku)} · ${escapeHtml(p.category)}</div>
          </div>
          ${getStatusBadge(getStockStatus(p))}
        </div>
        <div class="prediction-stats">
          <div class="prediction-stat">
            <div class="prediction-stat-label">Current Stock</div>
            <div class="prediction-stat-value">${p.stock}</div>
          </div>
          <div class="prediction-stat">
            <div class="prediction-stat-label">Predicted Demand</div>
            <div class="prediction-stat-value demand">${prediction.predictedDemand}</div>
          </div>
        </div>
        <div class="prediction-chart-wrap">
          <canvas class="prediction-chart" id="chart-${p.id}" width="340" height="160"></canvas>
          <div class="prediction-chart-legend">
            <span class="legend-item"><span class="legend-dot" style="background:var(--blue-500);"></span> Historical Sales</span>
            <span class="legend-item"><span class="legend-dot" style="background:var(--cyan-400);"></span> Predicted Demand</span>
          </div>
        </div>
        ${recommendation.html}
      </div>
    `;
  }).join('');

  products.forEach(p => {
    drawPredictionChart(p);
  });
}

function calculateDemand(product) {
  const history = product.salesHistory || [];
  if (history.length === 0) return { predictedDemand: 0, avgDemand: 0, confidence: 50 };

  const weights = [0.05, 0.08, 0.12, 0.15, 0.18, 0.20, 0.22];
  const recent = history.slice(-7);
  let weightedSum = 0;
  let weightTotal = 0;

  recent.forEach((val, i) => {
    const w = weights[i] || weights[weights.length - 1];
    weightedSum += val * w;
    weightTotal += w;
  });

  const avgDemand = weightedSum / weightTotal;
  const trend = recent.length > 1 ? (recent[recent.length - 1] - recent[0]) / recent.length : 0;
  const predictedDemand = Math.max(0, Math.round(avgDemand + trend * 0.5));

  const variance = recent.reduce((sum, v) => sum + Math.pow(v - avgDemand, 2), 0) / recent.length;
  const stdDev = Math.sqrt(variance);
  const cv = avgDemand > 0 ? stdDev / avgDemand : 1;
  const confidence = Math.max(50, Math.min(95, Math.round(95 - cv * 40)));

  return { predictedDemand, avgDemand: Math.round(avgDemand), confidence };
}

function generateRecommendation(product, prediction) {
  const reorderQty = Math.max(0, prediction.predictedDemand - product.stock);
  const isSufficient = reorderQty <= 0;

  const trendPct = product.salesHistory && product.salesHistory.length >= 2
    ? Math.round(((product.salesHistory[product.salesHistory.length - 1] - product.salesHistory[0]) / product.salesHistory[0]) * 100)
    : 0;

  const trendText = trendPct > 0
    ? `demand is expected to increase by approximately ${trendPct}% next month.`
    : trendPct < 0
    ? `demand is expected to decrease by approximately ${Math.abs(trendPct)}% next month.`
    : `demand is expected to remain stable.`;

  const body = `
    <div class="ai-reco-body">
      ${escapeHtml(product.name)} ${trendText}<br>
      Current Stock: ${product.stock} · Predicted Demand: ${prediction.predictedDemand}
    </div>
  `;

  const action = isSufficient
    ? '<div class="ai-reco-action sufficient">✓ Stock is sufficient. No reorder required.</div>'
    : `<div class="ai-reco-action">Reorder ${reorderQty} units</div>`;

  const confidenceBar = `
    <div class="ai-reco-confidence">
      <span>Confidence: ${prediction.confidence}%</span>
      <div class="confidence-bar"><div class="confidence-fill" style="width:${prediction.confidence}%"></div></div>
    </div>
  `;

  return {
    html: `
      <div class="ai-recommendation">
        <div class="ai-reco-header">
          <span class="ai-reco-icon">🤖</span>
          <span class="ai-reco-title">GreenStock AI Recommendation</span>
        </div>
        ${body}
        ${action}
        ${confidenceBar}
      </div>
    `,
    reorderQty,
    isSufficient,
  };
}

function drawPredictionChart(product) {
  const canvas = document.getElementById('chart-' + product.id);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const colors = getChartColors();
  const prediction = calculateDemand(product);

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = (rect.width || 340) * dpr;
  canvas.height = 160 * dpr;
  ctx.scale(dpr, dpr);
  const W = rect.width || 340;
  const H = 160;

  ctx.clearRect(0, 0, W, H);

  const history = product.salesHistory || [];
  const predicted = [history[history.length - 1] || 0, prediction.predictedDemand];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];

  const allData = [...history, prediction.predictedDemand];
  const maxVal = Math.max(...allData, 10);
  const niceMax = Math.ceil(maxVal / 10) * 10;

  const padding = { top: 15, right: 15, bottom: 30, left: 35 };
  const chartW = W - padding.left - padding.right;
  const chartH = H - padding.top - padding.bottom;

  ctx.strokeStyle = colors.grid;
  ctx.lineWidth = 1;
  ctx.font = '10px Inter, sans-serif';
  ctx.fillStyle = colors.text;

  for (let i = 0; i <= 4; i++) {
    const y = padding.top + (chartH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(W - padding.right, y);
    ctx.stroke();
    ctx.textAlign = 'right';
    ctx.fillText(Math.round(niceMax - (niceMax / 4) * i), padding.left - 6, y + 3);
  }

  const totalPoints = allData.length;
  const stepX = chartW / (totalPoints - 1);

  ctx.textAlign = 'center';
  const labelCount = Math.min(totalPoints, 8);
  for (let i = 0; i < labelCount; i++) {
    const x = padding.left + stepX * i;
    ctx.fillText(months[i] || '', x, H - padding.bottom + 18);
  }

  // Historical line
  ctx.strokeStyle = colors.blue;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  history.forEach((val, i) => {
    const x = padding.left + stepX * i;
    const y = padding.top + chartH - (val / niceMax) * chartH;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  ctx.fillStyle = colors.blue;
  history.forEach((val, i) => {
    const x = padding.left + stepX * i;
    const y = padding.top + chartH - (val / niceMax) * chartH;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  // Predicted line (dashed)
  ctx.strokeStyle = colors.cyan;
  ctx.lineWidth = 2.5;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  predicted.forEach((val, i) => {
    const x = padding.left + stepX * (history.length - 1 + i);
    const y = padding.top + chartH - (val / niceMax) * chartH;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = colors.cyan;
  predicted.forEach((val, i) => {
    const x = padding.left + stepX * (history.length - 1 + i);
    const y = padding.top + chartH - (val / niceMax) * chartH;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
  });
}

function runPrediction() {
  renderPrediction();
  showNotification('🤖 Demand prediction updated.', 'ai');
  addActivity('ai_predict', 'All Products', 0);
}

// ============================================================
// ACTIVITY LOG
// ============================================================
function renderActivity() {
  const tbody = document.getElementById('activityTableBody');
  const empty = document.getElementById('activityEmpty');

  if (activities.length === 0) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  tbody.innerHTML = activities.map(a => {
    const d = new Date(a.timestamp);
    return `
      <tr>
        <td><span style="display:inline-flex;align-items:center;gap:6px;">${getActivityIcon(a.action)} ${formatActionLabel(a.action)}</span></td>
        <td>${escapeHtml(a.product)}</td>
        <td>${a.quantity > 0 ? a.quantity : '—'}</td>
        <td>${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
        <td>${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</td>
      </tr>
    `;
  }).join('');
}

function addActivity(action, product, quantity) {
  const activity = {
    id: 'a' + Date.now() + Math.random().toString(36).slice(2, 6),
    action,
    product,
    quantity,
    timestamp: Date.now(),
  };
  activities.unshift(activity);
  if (activities.length > 200) activities = activities.slice(0, 200);
  saveActivities();
  renderRecentActivity();
  renderActivity();
}

function clearActivity() {
  activities = [];
  saveActivities();
  renderActivity();
  renderRecentActivity();
  showNotification('✓ Activity log cleared.', 'success');
}

function getActivityIcon(action) {
  const icons = {
    add: '📦', sell: '🛒', update: '✏️', edit: '📝', delete: '🗑️',
    low_alert: '⚠️', out_alert: '🚨', ai_predict: '🤖',
  };
  return icons[action] || '📋';
}

function getActivityIconClass(action) {
  const classes = {
    add: 'activity-icon-add', sell: 'activity-icon-remove', update: 'activity-icon-update',
    edit: 'activity-icon-edit', delete: 'activity-icon-delete',
    low_alert: 'activity-icon-alert', out_alert: 'activity-icon-out',
    ai_predict: 'activity-icon-ai',
  };
  return classes[action] || 'activity-icon-update';
}

function formatActivityText(a) {
  switch (a.action) {
    case 'add': return `+${a.quantity} ${a.product} units added`;
    case 'sell': return `-${a.quantity} ${a.product} units sold`;
    case 'update': return `${a.product} stock updated`;
    case 'edit': return `${a.product} details edited`;
    case 'delete': return `${a.product} deleted from inventory`;
    case 'low_alert': return `${a.product} marked as low stock`;
    case 'out_alert': return `${a.product} is out of stock`;
    case 'ai_predict': return `Demand prediction generated`;
    default: return `${a.product} activity`;
  }
}

function formatActionLabel(action) {
  const labels = {
    add: 'Stock Added', sell: 'Stock Sold', update: 'Stock Updated',
    edit: 'Product Edited', delete: 'Product Deleted',
    low_alert: 'Low Stock Alert', out_alert: 'Out of Stock Alert',
    ai_predict: 'AI Prediction',
  };
  return labels[action] || action;
}

function formatTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
  if (diff < 86400000) return `Today, ${new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
  if (diff < 172800000) return `Yesterday, ${new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ============================================================
// PRODUCT CRUD
// ============================================================
function openProductModal(id) {
  editingProductId = id || null;
  const overlay = document.getElementById('productModalOverlay');
  const title = document.getElementById('productModalTitle');
  const submitBtn = document.getElementById('productSubmitBtn');
  const initialStockGroup = document.getElementById('initialStockGroup');

  if (id) {
    const p = products.find(p => p.id === id);
    if (!p) return;
    title.textContent = 'Edit Product';
    submitBtn.textContent = 'Save Changes';
    document.getElementById('productId').value = p.id;
    document.getElementById('productName').value = p.name;
    document.getElementById('productSku').value = p.sku;
    document.getElementById('productCategory').value = p.category;
    document.getElementById('productPrice').value = p.price;
    document.getElementById('productStock').value = p.stock;
    document.getElementById('productMinStock').value = p.minStock;
    document.getElementById('productSupplier').value = p.supplier || '';
    document.getElementById('productDescription').value = p.description || '';
    initialStockGroup.style.display = 'none';
  } else {
    title.textContent = 'Add Product';
    submitBtn.textContent = 'Add Product';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('productMinStock').value = settings.defaultMinStock;
    initialStockGroup.style.display = 'flex';
  }

  overlay.classList.add('show');
}

function closeProductModal() {
  document.getElementById('productModalOverlay').classList.remove('show');
  editingProductId = null;
}

function submitProduct(event) {
  event.preventDefault();

  const name = document.getElementById('productName').value.trim();
  const sku = document.getElementById('productSku').value.trim();
  const category = document.getElementById('productCategory').value;
  const price = parseFloat(document.getElementById('productPrice').value);
  const stock = parseInt(document.getElementById('productStock').value) || 0;
  const minStock = parseInt(document.getElementById('productMinStock').value);
  const supplier = document.getElementById('productSupplier').value.trim();
  const description = document.getElementById('productDescription').value.trim();

  if (!name || !sku || !category || isNaN(price) || price < 0 || isNaN(minStock) || minStock < 0) {
    showNotification('⚠️ Please fill all required fields correctly.', 'warning');
    return false;
  }

  const existingSku = products.find(p => p.sku.toLowerCase() === sku.toLowerCase() && p.id !== editingProductId);
  if (existingSku) {
    showNotification('⚠️ A product with this SKU already exists.', 'warning');
    return false;
  }

  if (editingProductId) {
    const p = products.find(p => p.id === editingProductId);
    if (!p) return false;
    p.name = name;
    p.sku = sku;
    p.category = category;
    p.price = price;
    p.minStock = minStock;
    p.supplier = supplier;
    p.description = description;
    saveProducts();
    addActivity('edit', name, 0);
    showNotification('✓ Product updated successfully.', 'success');
  } else {
    const newProduct = {
      id: 'p' + Date.now(),
      name, sku, category, price, stock, minStock, supplier, description,
      salesHistory: generateSalesHistory(),
    };
    products.push(newProduct);
    saveProducts();
    addActivity('add', name, stock);
    showNotification('✓ Product added successfully.', 'success');
  }

  closeProductModal();
  renderAll();
  return false;
}

function generateSalesHistory() {
  const history = [];
  let base = 15 + Math.floor(Math.random() * 25);
  for (let i = 0; i < 7; i++) {
    const variance = Math.floor((Math.random() - 0.4) * 10);
    base = Math.max(5, base + variance);
    history.push(base);
  }
  return history;
}

function openDeleteModal(id) {
  deletingProductId = id;
  const p = products.find(p => p.id === id);
  if (!p) return;
  document.getElementById('deleteConfirmText').innerHTML =
    `Are you sure you want to remove <strong>${escapeHtml(p.name)}</strong> from your inventory?`;
  document.getElementById('deleteModalOverlay').classList.add('show');
}

function closeDeleteModal() {
  document.getElementById('deleteModalOverlay').classList.remove('show');
  deletingProductId = null;
}

function confirmDelete() {
  const p = products.find(p => p.id === deletingProductId);
  if (!p) return;
  const name = p.name;
  products = products.filter(p => p.id !== deletingProductId);
  saveProducts();
  addActivity('delete', name, 0);
  closeDeleteModal();
  renderAll();
  showNotification('✓ Product deleted.', 'success');
}

function adjustStock(id, delta) {
  const p = products.find(p => p.id === id);
  if (!p) return;
  const newStock = p.stock + delta;
  if (newStock < 0) {
    showNotification('⚠️ Stock cannot go below zero.', 'warning');
    return;
  }

  const oldStatus = getStockStatus(p);
  p.stock = newStock;
  saveProducts();

  if (delta > 0) {
    addActivity('add', p.name, delta);
    showNotification(`✓ ${p.name} stock increased to ${newStock}.`, 'success');
  } else {
    addActivity('sell', p.name, Math.abs(delta));
    showNotification(`✓ ${p.name} stock decreased to ${newStock}.`, 'success');
  }

  const newStatus = getStockStatus(p);
  if (newStatus === 'low' && oldStatus !== 'low') {
    showNotification(`⚠️ ${p.name} is running low on stock.`, 'warning');
    addActivity('low_alert', p.name, 0);
  }
  if (newStatus === 'out' && oldStatus !== 'out') {
    showNotification(`🚨 ${p.name} is out of stock.`, 'error');
    addActivity('out_alert', p.name, 0);
  }

  renderAll();
}

// ============================================================
// PRODUCT DETAILS MODAL
// ============================================================
function openDetailsModal(id) {
  const p = products.find(p => p.id === id);
  if (!p) return;
  const status = getStockStatus(p);
  const prediction = calculateDemand(p);
  const recommendation = generateRecommendation(p, prediction);
  const inventoryValue = p.price * p.stock;

  const body = document.getElementById('detailsModalBody');
  body.innerHTML = `
    <div style="margin-bottom:20px;">
      <h2 style="font-size:1.4rem;margin-bottom:4px;">${escapeHtml(p.name)}</h2>
      <p style="color:var(--text-secondary);font-size:0.88rem;">${escapeHtml(p.description || 'No description available.')}</p>
    </div>
    <div class="details-grid">
      <div class="details-section"><h4>SKU</h4><div class="details-value">${escapeHtml(p.sku)}</div></div>
      <div class="details-section"><h4>Category</h4><div class="details-value">${escapeHtml(p.category)}</div></div>
      <div class="details-section"><h4>Price</h4><div class="details-value">${formatCurrency(p.price)}</div></div>
      <div class="details-section"><h4>Current Stock</h4><div class="details-value">${p.stock} units</div></div>
      <div class="details-section"><h4>Minimum Stock</h4><div class="details-value">${p.minStock} units</div></div>
      <div class="details-section"><h4>Supplier</h4><div class="details-value">${escapeHtml(p.supplier || 'N/A')}</div></div>
      <div class="details-section"><h4>Status</h4><div class="details-value">${getStatusBadge(status)}</div></div>
      <div class="details-section"><h4>Inventory Value</h4><div class="details-value">${formatCurrency(inventoryValue)}</div></div>
    </div>
    <div class="details-chart-section">
      <h4 style="margin-bottom:12px;">Historical Sales & Predicted Demand</h4>
      <canvas id="details-chart" width="720" height="200" style="width:100%;height:200px;"></canvas>
      <div class="prediction-chart-legend" style="margin-top:8px;">
        <span class="legend-item"><span class="legend-dot" style="background:var(--blue-500);"></span> Historical Sales</span>
        <span class="legend-item"><span class="legend-dot" style="background:var(--cyan-400);"></span> Predicted Demand</span>
      </div>
    </div>
    <div style="margin-top:20px;">
      ${recommendation.html}
    </div>
  `;

  document.getElementById('detailsModalOverlay').classList.add('show');

  setTimeout(() => {
    drawDetailsChart(p, prediction);
  }, 50);
}

function closeDetailsModal() {
  document.getElementById('detailsModalOverlay').classList.remove('show');
}

function drawDetailsChart(product, prediction) {
  const canvas = document.getElementById('details-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const colors = getChartColors();

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = (rect.width || 720) * dpr;
  canvas.height = 200 * dpr;
  ctx.scale(dpr, dpr);
  const W = rect.width || 720;
  const H = 200;

  ctx.clearRect(0, 0, W, H);

  const history = product.salesHistory || [];
  const predicted = [history[history.length - 1] || 0, prediction.predictedDemand];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
  const allData = [...history, prediction.predictedDemand];
  const maxVal = Math.max(...allData, 10);
  const niceMax = Math.ceil(maxVal / 10) * 10;

  const padding = { top: 15, right: 20, bottom: 35, left: 40 };
  const chartW = W - padding.left - padding.right;
  const chartH = H - padding.top - padding.bottom;

  ctx.strokeStyle = colors.grid;
  ctx.lineWidth = 1;
  ctx.font = '11px Inter, sans-serif';
  ctx.fillStyle = colors.text;

  for (let i = 0; i <= 4; i++) {
    const y = padding.top + (chartH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(W - padding.right, y);
    ctx.stroke();
    ctx.textAlign = 'right';
    ctx.fillText(Math.round(niceMax - (niceMax / 4) * i), padding.left - 8, y + 3);
  }

  const totalPoints = allData.length;
  const stepX = chartW / (totalPoints - 1);

  ctx.textAlign = 'center';
  for (let i = 0; i < totalPoints; i++) {
    const x = padding.left + stepX * i;
    ctx.fillText(months[i] || '', x, H - padding.bottom + 20);
  }

  ctx.strokeStyle = colors.blue;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  history.forEach((val, i) => {
    const x = padding.left + stepX * i;
    const y = padding.top + chartH - (val / niceMax) * chartH;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  ctx.fillStyle = colors.blue;
  history.forEach((val, i) => {
    const x = padding.left + stepX * i;
    const y = padding.top + chartH - (val / niceMax) * chartH;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.strokeStyle = colors.cyan;
  ctx.lineWidth = 2.5;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  predicted.forEach((val, i) => {
    const x = padding.left + stepX * (history.length - 1 + i);
    const y = padding.top + chartH - (val / niceMax) * chartH;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = colors.cyan;
  predicted.forEach((val, i) => {
    const x = padding.left + stepX * (history.length - 1 + i);
    const y = padding.top + chartH - (val / niceMax) * chartH;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  });
}

// ============================================================
// AI ASSISTANT
// ============================================================
function openAiDrawer() {
  document.getElementById('aiDrawer').classList.add('show');
}

function closeAiDrawer() {
  document.getElementById('aiDrawer').classList.remove('show');
}

function askAI(message) {
  const chatBody = document.getElementById('aiChatBody');
  const input = document.getElementById('aiChatInput');
  if (input) input.value = '';

  const userMsg = document.createElement('div');
  userMsg.className = 'ai-msg ai-msg-user';
  userMsg.innerHTML = `<div class="ai-msg-content">${escapeHtml(message)}</div>`;
  chatBody.appendChild(userMsg);

  chatBody.scrollTop = chatBody.scrollHeight;

  setTimeout(() => {
    const response = generateAIResponse(message);
    const botMsg = document.createElement('div');
    botMsg.className = 'ai-msg ai-msg-bot';
    botMsg.innerHTML = `<div class="ai-msg-content">${response}</div>`;
    chatBody.appendChild(botMsg);
    chatBody.scrollTop = chatBody.scrollHeight;
  }, 400);
}

function generateAIResponse(message) {
  const msg = message.toLowerCase();
  const stats = calculateInventoryStats();
  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= p.minStock);
  const outStockProducts = products.filter(p => p.stock === 0);

  if (msg.includes('low') && msg.includes('stock')) {
    if (lowStockProducts.length === 0) return 'Good news! No products are currently low on stock. 📊';
    return `⚠️ <strong>${lowStockProducts.length} products are low on stock:</strong><br><br>` +
      lowStockProducts.map(p => `• ${p.name} — ${p.stock} units (min: ${p.minStock})`).join('<br>');
  }

  if (msg.includes('out') && msg.includes('stock')) {
    if (outStockProducts.length === 0) return 'No products are out of stock. 📊';
    return `🚨 <strong>${outStockProducts.length} products are out of stock:</strong><br><br>` +
      outStockProducts.map(p => `• ${p.name} (${p.sku})`).join('<br>');
  }

  if (msg.includes('reorder') || msg.includes('what should i')) {
    const recommendations = products.map(p => {
      const pred = calculateDemand(p);
      const reorder = Math.max(0, pred.predictedDemand - p.stock);
      return { product: p, reorder, predicted: pred.predictedDemand, confidence: pred.confidence };
    }).filter(r => r.reorder > 0).sort((a, b) => b.reorder - a.reorder);

    if (recommendations.length === 0) return '✓ All products have sufficient stock. No reorders needed at this time.';
    return `🤖 <strong>Reorder recommendations:</strong><br><br>` +
      recommendations.slice(0, 5).map(r => `• ${r.product.name} — reorder ${r.reorder} units (predicted demand: ${r.predicted}, confidence: ${r.confidence}%)`).join('<br>');
  }

  if (msg.includes('highest demand') || msg.includes('selling the most') || msg.includes('top product')) {
    const sorted = [...products].sort((a, b) => {
      const aAvg = (a.salesHistory || []).reduce((s, v) => s + v, 0) / (a.salesHistory || []).length || 0;
      const bAvg = (b.salesHistory || []).reduce((s, v) => s + v, 0) / (b.salesHistory || []).length || 0;
      return bAvg - aAvg;
    });
    return `📈 <strong>Top products by demand:</strong><br><br>` +
      sorted.slice(0, 5).map((p, i) => {
        const avg = Math.round((p.salesHistory || []).reduce((s, v) => s + v, 0) / (p.salesHistory || [1]).length);
        return `${i + 1}. ${p.name} — avg ${avg} units/period`;
      }).join('<br>');
  }

  if (msg.includes('total inventory value') || msg.includes('inventory value')) {
    return `💰 Your total inventory value is <strong>${formatCurrency(stats.inventoryValue)}</strong> across ${stats.totalProducts} products.`;
  }

  if (msg.includes('need attention') || msg.includes('attention')) {
    const attention = [...lowStockProducts, ...outStockProducts];
    if (attention.length === 0) return '✓ All products are well stocked. Nothing needs attention right now.';
    return `⚠️ <strong>${attention.length} products need attention:</strong><br><br>` +
      attention.map(p => {
        const status = getStockStatus(p);
        const label = status === 'out' ? '🚨 Out of stock' : '⚠️ Low stock';
        return `• ${p.name} — ${label} (${p.stock}/${p.minStock})`;
      }).join('<br>');
  }

  if (msg.includes('predict') && (msg.includes('laptop') || msg.includes('demand'))) {
    const target = products.find(p => p.name.toLowerCase().includes('laptop'));
    if (!target) return 'No laptop product found in your inventory.';
    const pred = calculateDemand(target);
    const reorder = Math.max(0, pred.predictedDemand - target.stock);
    return `🔮 <strong>Demand prediction for ${target.name}:</strong><br><br>` +
      `Current stock: ${target.stock}<br>` +
      `Predicted demand: ${pred.predictedDemand} units<br>` +
      `Confidence: ${pred.confidence}%<br>` +
      (reorder > 0 ? `Recommended reorder: ${reorder} units` : '✓ Stock is sufficient.');
  }

  if (msg.includes('total product') || msg.includes('how many product')) {
    return `📦 You have <strong>${stats.totalProducts} products</strong> in your inventory with a total of ${stats.currentStock} units in stock.`;
  }

  if (msg.includes('health')) {
    const score = calculateInventoryHealth();
    return `🏥 Your inventory health score is <strong>${score}/100</strong>. ${score >= 75 ? 'Your inventory is in great shape!' : score >= 50 ? 'Some products need attention.' : 'Several products need restocking.'}`;
  }

  return `I can help you with:<br>• Low stock alerts<br>• Out-of-stock products<br>• Reorder recommendations<br>• Highest demand products<br>• Total inventory value<br>• Products needing attention<br>• Demand predictions<br><br>Try asking: "Which products are low in stock?" or "What should I reorder?"`;
}

/**
 * Future n8n AI Agent integration point.
 * Replace the local generateAIResponse() with a call to your n8n webhook.
 * Do NOT put API keys in frontend code — use environment variables
 * or a proxy endpoint.
 */
async function askGreenStockAI(message) {
  // Future n8n webhook integration
  // const response = await fetch(N8N_WEBHOOK_URL, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ message, products, activities }),
  // });
  // return await response.json();
  return generateAIResponse(message);
}

// ============================================================
// SETTINGS
// ============================================================
function renderSettings() {
  document.getElementById('settingMinStock').value = settings.defaultMinStock;
  document.getElementById('settingCurrency').value = settings.currency;
  updateThemeButton();
}

function saveSettings() {
  const minStock = parseInt(document.getElementById('settingMinStock').value);
  const currency = document.getElementById('settingCurrency').value;

  if (!isNaN(minStock) && minStock >= 0) settings.defaultMinStock = minStock;
  settings.currency = currency;
  saveSettingsToStorage();
  showNotification('✓ Settings saved.', 'success');
  renderAll();
}

function saveSettingsToStorage() {
  localStorage.setItem('stockpilot_settings', JSON.stringify(settings));
}

function resetData() {
  if (!confirm('This will reset all products and activities to demo data. Continue?')) return;
  products = [...DEMO_PRODUCTS];
  activities = [...DEMO_ACTIVITIES];
  saveProducts();
  saveActivities();
  renderAll();
  showNotification('✓ Demo data restored.', 'success');
}

// ============================================================
// NOTIFICATIONS (TOAST)
// ============================================================
function showNotification(message, type) {
  type = type || 'success';
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icons = { success: '✓', warning: '⚠️', error: '🚨', ai: '🤖' };
  toast.innerHTML = `<span class="toast-icon">${icons[type] || '✓'}</span><span class="toast-text">${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ============================================================
// UTILITIES
// ============================================================
function animateCounter(elementId, target, duration) {
  duration = duration || 1000;
  const el = document.getElementById(elementId);
  if (!el) return;
  const start = parseInt(el.textContent.replace(/[^0-9]/g, '')) || 0;
  const startTime = performance.now();

  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(start + (target - start) * eased);
    el.textContent = current.toLocaleString();
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

function formatCurrency(value) {
  const symbol = CURRENCY_SYMBOLS[settings.currency] || '$';
  return symbol + value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ============================================================
// REDRAW ON RESIZE
// ============================================================
window.addEventListener('resize', () => {
  if (currentPage === 'dashboard') {
    drawOverviewChart();
    drawHealthChart();
    drawCategoryChart();
  }
  if (currentPage === 'prediction') {
    products.forEach(p => drawPredictionChart(p));
  }
});

// ============================================================
// START
// ============================================================
document.addEventListener('DOMContentLoaded', initializeApp);
