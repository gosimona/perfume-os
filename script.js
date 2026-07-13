const STORAGE_KEY = 'perfume-os-sales-v1';
const STORAGE_KEY_INVENTORY = 'perfume-os-inventory-v1';

/** @type {Array<{id:string, customer:string, perfume:string, qty:number, price:number, paid:number, date:string, notes:string}>} */
let sales = loadSales();
/** @type {Array<{id:string, perfume:string, price:number, stock:number, threshold:number}>} */
let inventory = loadInventory();
let currentFilter = 'all';
let searchTerm = '';
let currentView = 'sales';
let invFilter = 'all';
let invSearchTerm = '';

const salesBody = document.getElementById('salesBody');
const emptyState = document.getElementById('emptyState');
const modalBackdrop = document.getElementById('modalBackdrop');
const saleForm = document.getElementById('saleForm');
const modalTitle = document.getElementById('modalTitle');

const inventoryBody = document.getElementById('inventoryBody');
const invEmptyState = document.getElementById('invEmptyState');
const itemModalBackdrop = document.getElementById('itemModalBackdrop');
const itemForm = document.getElementById('itemForm');

function loadSales() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSales() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sales));
}

function loadInventory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_INVENTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveInventory() {
  localStorage.setItem(STORAGE_KEY_INVENTORY, JSON.stringify(inventory));
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function money(n) {
  return '$' + (Number(n) || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function statusOf(sale) {
  const total = sale.qty * sale.price;
  const owed = total - sale.paid;
  if (owed <= 0.005) return 'paid';
  if (sale.paid > 0) return 'partial';
  return 'owing';
}

function statusLabel(status) {
  return { paid: 'Pagado', partial: 'Parcial', owing: 'Debe' }[status];
}

function render() {
  const term = searchTerm.trim().toLowerCase();
  const filtered = sales.filter((s) => {
    const matchesTerm = !term || s.customer.toLowerCase().includes(term) || s.perfume.toLowerCase().includes(term);
    const matchesFilter = currentFilter === 'all' || statusOf(s) === currentFilter;
    return matchesTerm && matchesFilter;
  });

  salesBody.innerHTML = '';
  emptyState.style.display = sales.length === 0 ? 'block' : 'none';
  emptyState.textContent = sales.length === 0
    ? 'Aún no hay ventas registradas. Toca + Nueva Venta para empezar.'
    : '';

  if (sales.length > 0 && filtered.length === 0) {
    emptyState.style.display = 'block';
    emptyState.textContent = 'Ningún resultado coincide con tu búsqueda o filtro.';
  }

  filtered.forEach((sale) => {
    salesBody.appendChild(buildRow(sale));
  });

  renderStats();
  renderInventory();
}

function buildRow(sale) {
  const tr = document.createElement('tr');
  tr.dataset.id = sale.id;
  const total = sale.qty * sale.price;
  const owed = Math.max(0, total - sale.paid);
  const status = statusOf(sale);

  tr.innerHTML = `
    <td><input class="editable" data-field="customer" value="${escapeAttr(sale.customer)}"></td>
    <td><input class="editable" data-field="perfume" value="${escapeAttr(sale.perfume)}"></td>
    <td><input class="editable" data-field="qty" type="number" min="1" step="1" value="${sale.qty}" style="width:64px"></td>
    <td><input class="editable" data-field="price" type="number" min="0" step="0.01" value="${sale.price}" style="width:90px"></td>
    <td class="cell-total">${money(total)}</td>
    <td><input class="editable" data-field="paid" type="number" min="0" step="0.01" value="${sale.paid}" style="width:90px"></td>
    <td class="cell-owed ${owed <= 0.005 ? 'zero' : 'some'}">${money(owed)}</td>
    <td><button class="status-pill status-${status}" data-action="cycle-status">${statusLabel(status)}</button></td>
    <td><input class="editable" data-field="date" type="date" value="${sale.date}" style="width:140px"></td>
    <td><input class="editable" data-field="notes" value="${escapeAttr(sale.notes || '')}" placeholder="—"></td>
    <td class="row-actions"><button class="btn btn-icon btn-danger" data-action="delete" title="Eliminar">✕</button></td>
  `;
  return tr;
}

function escapeAttr(str) {
  return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function renderStats() {
  let totalSales = 0, totalPaid = 0, totalOwed = 0;
  const debtors = new Set();

  sales.forEach((s) => {
    const total = s.qty * s.price;
    const owed = total - s.paid;
    totalSales += total;
    totalPaid += s.paid;
    if (owed > 0.005) {
      totalOwed += owed;
      debtors.add(s.customer.trim().toLowerCase());
    }
  });

  document.getElementById('statTotalSales').textContent = money(totalSales);
  document.getElementById('statPaid').textContent = money(totalPaid);
  document.getElementById('statOwed').textContent = money(totalOwed);
  document.getElementById('statDebtors').textContent = debtors.size;
}

// --- Inventory ---

function soldQtyFor(perfumeName) {
  const key = perfumeName.trim().toLowerCase();
  return sales.reduce((sum, s) => (s.perfume.trim().toLowerCase() === key ? sum + s.qty : sum), 0);
}

function inventoryRows() {
  return inventory.map((item) => {
    const sold = soldQtyFor(item.perfume);
    const available = Math.max(0, item.stock - sold);
    const threshold = item.threshold || 0;
    let status = 'ok';
    if (available <= 0) status = 'out';
    else if (available <= threshold) status = 'low';
    return { item, sold, available, status };
  });
}

function renderInventory() {
  const term = invSearchTerm.trim().toLowerCase();
  const rows = inventoryRows();

  const filtered = rows.filter(({ item, status }) => {
    const matchesTerm = !term || item.perfume.toLowerCase().includes(term);
    const matchesFilter = invFilter === 'all' || status === invFilter;
    return matchesTerm && matchesFilter;
  });

  inventoryBody.innerHTML = '';
  invEmptyState.style.display = inventory.length === 0 ? 'block' : 'none';
  invEmptyState.textContent = inventory.length === 0
    ? 'Aún no hay productos en inventario. Toca + Nuevo Producto para agregar uno.'
    : '';

  if (inventory.length > 0 && filtered.length === 0) {
    invEmptyState.style.display = 'block';
    invEmptyState.textContent = 'Ningún producto coincide con tu búsqueda o filtro.';
  }

  filtered.forEach(({ item, sold, available, status }) => {
    inventoryBody.appendChild(buildInventoryRow(item, sold, available, status));
  });

  renderInventoryStats(rows);
  refreshPerfumeDatalist();
}

const STATUS_PILL_CLASS = { ok: 'status-paid', low: 'status-partial', out: 'status-owing' };
const STATUS_PILL_LABEL = { ok: 'OK', low: 'Bajo stock', out: 'Agotado' };

function buildInventoryRow(item, sold, available, status) {
  const tr = document.createElement('tr');
  tr.dataset.id = item.id;

  tr.innerHTML = `
    <td><input class="editable" data-field="perfume" value="${escapeAttr(item.perfume)}"></td>
    <td><input class="editable" data-field="price" type="number" min="0" step="0.01" value="${item.price}" style="width:90px"></td>
    <td><input class="editable" data-field="stock" type="number" min="0" step="1" value="${item.stock}" style="width:80px"></td>
    <td>${sold}</td>
    <td class="cell-owed ${available > 0 ? 'zero' : 'some'}">${available}</td>
    <td><input class="editable" data-field="threshold" type="number" min="0" step="1" value="${item.threshold || 0}" style="width:70px"></td>
    <td><span class="status-pill ${STATUS_PILL_CLASS[status]}">${STATUS_PILL_LABEL[status]}</span></td>
    <td class="row-actions"><button class="btn btn-icon btn-danger" data-action="delete-item" title="Eliminar">✕</button></td>
  `;
  return tr;
}

function renderInventoryStats(rows) {
  document.getElementById('statProducts').textContent = inventory.length;
  document.getElementById('statUnits').textContent = rows.reduce((sum, r) => sum + r.available, 0);
  document.getElementById('statLow').textContent = rows.filter((r) => r.status === 'low').length;
  document.getElementById('statOut').textContent = rows.filter((r) => r.status === 'out').length;
}

function refreshPerfumeDatalist() {
  const datalist = document.getElementById('perfumeList');
  datalist.innerHTML = inventory.map((i) => `<option value="${escapeAttr(i.perfume)}"></option>`).join('');
}

inventoryBody.addEventListener('change', (e) => {
  const target = e.target;
  if (!target.classList.contains('editable')) return;
  const tr = target.closest('tr');
  const item = inventory.find((i) => i.id === tr.dataset.id);
  if (!item) return;
  const field = target.dataset.field;

  if (field === 'stock' || field === 'threshold') item[field] = Math.max(0, parseInt(target.value, 10) || 0);
  else if (field === 'price') item.price = Math.max(0, parseFloat(target.value) || 0);
  else item[field] = target.value;

  saveInventory();
  renderInventory();
});

inventoryBody.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action="delete-item"]');
  if (!btn) return;
  const tr = btn.closest('tr');
  const item = inventory.find((i) => i.id === tr.dataset.id);
  if (!item) return;

  if (confirm(`¿Eliminar "${item.perfume}" del inventario?`)) {
    inventory = inventory.filter((i) => i.id !== item.id);
    saveInventory();
    renderInventory();
  }
});

document.getElementById('invSearchInput').addEventListener('input', (e) => {
  invSearchTerm = e.target.value;
  renderInventory();
});

document.getElementById('invFilterChips').addEventListener('click', (e) => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  document.querySelectorAll('#invFilterChips .chip').forEach((c) => c.classList.remove('active'));
  chip.classList.add('active');
  invFilter = chip.dataset.filter;
  renderInventory();
});

// --- Item modal (new inventory product) ---

document.getElementById('btnCancelItem').addEventListener('click', closeItemModal);
itemModalBackdrop.addEventListener('click', (e) => {
  if (e.target === itemModalBackdrop) closeItemModal();
});

function openItemModal() {
  itemForm.reset();
  document.getElementById('iStock').value = 1;
  document.getElementById('iThreshold').value = 3;
  itemModalBackdrop.classList.add('open');
  document.getElementById('iPerfume').focus();
}

function closeItemModal() {
  itemModalBackdrop.classList.remove('open');
}

itemForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const item = {
    id: uid(),
    perfume: document.getElementById('iPerfume').value.trim(),
    price: Math.max(0, parseFloat(document.getElementById('iPrice').value) || 0),
    stock: Math.max(0, parseInt(document.getElementById('iStock').value, 10) || 0),
    threshold: Math.max(0, parseInt(document.getElementById('iThreshold').value, 10) || 0),
  };
  inventory.unshift(item);
  saveInventory();
  closeItemModal();
  renderInventory();
});

// --- View tabs (Ventas / Inventario) ---

function switchView(view) {
  currentView = view;
  document.getElementById('viewSales').hidden = view !== 'sales';
  document.getElementById('viewInventory').hidden = view !== 'inventory';
  document.querySelectorAll('.view-tabs .tab').forEach((t) => t.classList.toggle('active', t.dataset.view === view));
  document.getElementById('btnAdd').textContent = view === 'sales' ? '+ Nueva Venta' : '+ Nuevo Producto';
}

document.querySelectorAll('.view-tabs .tab').forEach((tab) => {
  tab.addEventListener('click', () => switchView(tab.dataset.view));
});

document.getElementById('btnAdd').addEventListener('click', () => {
  if (currentView === 'sales') openModal();
  else openItemModal();
});

// --- Table interactions (inline editing, status cycle, delete) ---

salesBody.addEventListener('change', (e) => {
  const target = e.target;
  if (!target.classList.contains('editable')) return;
  const tr = target.closest('tr');
  const sale = sales.find((s) => s.id === tr.dataset.id);
  if (!sale) return;
  const field = target.dataset.field;

  if (field === 'qty') sale.qty = Math.max(1, parseInt(target.value, 10) || 1);
  else if (field === 'price' || field === 'paid') sale[field] = Math.max(0, parseFloat(target.value) || 0);
  else sale[field] = target.value;

  saveSales();
  render();
});

salesBody.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const tr = btn.closest('tr');
  const sale = sales.find((s) => s.id === tr.dataset.id);
  if (!sale) return;

  if (btn.dataset.action === 'delete') {
    if (confirm(`¿Eliminar la venta de "${sale.customer}" (${sale.perfume})?`)) {
      sales = sales.filter((s) => s.id !== sale.id);
      saveSales();
      render();
    }
  } else if (btn.dataset.action === 'cycle-status') {
    const total = sale.qty * sale.price;
    const status = statusOf(sale);
    if (status === 'owing') sale.paid = total; // -> paid
    else if (status === 'paid') sale.paid = 0; // -> owing
    else sale.paid = total; // partial -> paid
    saveSales();
    render();
  }
});

// --- Search & filters ---

document.getElementById('searchInput').addEventListener('input', (e) => {
  searchTerm = e.target.value;
  render();
});

document.getElementById('filterChips').addEventListener('click', (e) => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  document.querySelectorAll('#filterChips .chip').forEach((c) => c.classList.remove('active'));
  chip.classList.add('active');
  currentFilter = chip.dataset.filter;
  render();
});

// --- Modal (new sale) ---

document.getElementById('btnCancel').addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', (e) => {
  if (e.target === modalBackdrop) closeModal();
});

function openModal() {
  saleForm.reset();
  document.getElementById('saleId').value = '';
  document.getElementById('fQty').value = 1;
  document.getElementById('fPaid').value = 0;
  document.getElementById('fDate').value = new Date().toISOString().slice(0, 10);
  modalTitle.textContent = 'Nueva Venta';
  modalBackdrop.classList.add('open');
  document.getElementById('fCustomer').focus();
}

function closeModal() {
  modalBackdrop.classList.remove('open');
}

saleForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const sale = {
    id: uid(),
    customer: document.getElementById('fCustomer').value.trim(),
    perfume: document.getElementById('fPerfume').value.trim(),
    qty: Math.max(1, parseInt(document.getElementById('fQty').value, 10) || 1),
    price: Math.max(0, parseFloat(document.getElementById('fPrice').value) || 0),
    paid: Math.max(0, parseFloat(document.getElementById('fPaid').value) || 0),
    date: document.getElementById('fDate').value,
    notes: document.getElementById('fNotes').value.trim(),
  };
  sales.unshift(sale);
  saveSales();
  closeModal();
  render();
});

// --- Export / Import (local backup) ---

document.getElementById('btnExport').addEventListener('click', () => {
  const backup = { sales, inventory };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `perfume-os-respaldo-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById('importFile').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      const importedSales = Array.isArray(imported) ? imported : imported.sales;
      const importedInventory = Array.isArray(imported) ? [] : imported.inventory;
      if (!Array.isArray(importedSales)) throw new Error('formato inválido');
      if ((sales.length > 0 || inventory.length > 0) && !confirm('Esto reemplazará las ventas e inventario actuales con los del archivo. ¿Continuar?')) return;
      sales = importedSales;
      inventory = Array.isArray(importedInventory) ? importedInventory : [];
      saveSales();
      saveInventory();
      render();
    } catch {
      alert('No se pudo leer el archivo. Asegúrate de que sea un respaldo JSON válido de PerfumeOS.');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
});

// --- Init ---

render();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
