/**
 * ==============================================================================
 * FESTIVAL ABREU PRO RAP 2026 - MÓDULO A: GESTÃO DE FORNECEDORES & CUSTOS
 * ==============================================================================
 */

import { getCurrentUser, getCurrentUserProfile, isDirecao, hasPermission } from './auth.js';
import { syncSupplierToSheets, syncAllSuppliersToSheets } from './sheets-sync.js';

let allSuppliers = [];
let firestoreDb = null;
let firestoreMethods = null;
let unsubscribeSuppliers = null;

export function initSuppliers(db, methods) {
  firestoreDb = db;
  firestoreMethods = methods;
  subscribeToSuppliers();
}

/**
 * Escuta atualizações em tempo real do Firestore
 */
function subscribeToSuppliers() {
  if (unsubscribeSuppliers) unsubscribeSuppliers();

  const { collection, onSnapshot, query, orderBy } = firestoreMethods;
  const suppliersRef = collection(firestoreDb, 'suppliers');
  const q = query(suppliersRef, orderBy('createdAt', 'desc'));

  unsubscribeSuppliers = onSnapshot(q, (snapshot) => {
    allSuppliers = [];
    snapshot.forEach(doc => {
      allSuppliers.push({ id: doc.id, ...doc.data() });
    });

    renderSuppliers();
    updateFinancialKPIs();
  }, (error) => {
    console.error('[Suppliers] Erro ao carregar fornecedores:', error);
    // Fallback para dados de demonstração caso as regras do Firestore ainda não estejam publicadas
    if (allSuppliers.length === 0) {
      loadFallbackSuppliers();
    }
  });
}

function loadFallbackSuppliers() {
  allSuppliers = [
    {
      id: 'sup-demo-01',
      name: 'Mega Palcos & Estruturas PE',
      category: 'Estrutura/Palco',
      contactName: 'Carlos Eduardo',
      phone: '(81) 98765-4321',
      amount: 45000.00,
      paymentStatus: 'Parcial',
      dueDate: '2026-11-15',
      paidDate: '2026-10-10',
      notes: 'Palco principal 14x10m + House Mix + Gradis de contenção',
      createdByName: 'Direção APR',
      createdAt: new Date().toISOString()
    },
    {
      id: 'sup-demo-02',
      name: 'Vibe Sound & Iluminação Cênica',
      category: 'Som & Iluminação',
      contactName: 'Renato Lima',
      phone: '(81) 99123-4567',
      amount: 32000.00,
      paymentStatus: 'Pendente',
      dueDate: '2026-11-18',
      paidDate: '',
      notes: 'Sistema Line Array para 8.000 pessoas + iluminação de show',
      createdByName: 'Produção Técnica',
      createdAt: new Date().toISOString()
    },
    {
      id: 'sup-demo-03',
      name: 'Batalha do Concreto Produções',
      category: 'Artistas/Cachê',
      contactName: 'MC Yuri',
      phone: '(81) 98888-7777',
      amount: 18500.00,
      paymentStatus: 'Quitado',
      dueDate: '2026-10-05',
      paidDate: '2026-10-05',
      notes: 'Cachê premiação da Batalha de Rimas e MCs convidados',
      createdByName: 'Direção Geral',
      createdAt: new Date().toISOString()
    }
  ];
  renderSuppliers();
  updateFinancialKPIs();
}

/**
 * Atualiza os Cards com KPIs Financeiros
 */
export function updateFinancialKPIs() {
  let totalContratado = 0;
  let totalPago = 0;
  let totalPendente = 0;

  allSuppliers.forEach(item => {
    const amount = Number(item.amount) || 0;
    totalContratado += amount;

    if (item.paymentStatus === 'Quitado') {
      totalPago += amount;
    } else if (item.paymentStatus === 'Parcial') {
      // Considera metade paga como estimativa padrão se não houver detalhamento
      totalPago += (amount * 0.5);
      totalPendente += (amount * 0.5);
    } else {
      totalPendente += amount;
    }
  });

  const formatBRL = (val) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const elContratado = document.getElementById('kpi-total-contratado');
  const elPago = document.getElementById('kpi-total-pago');
  const elPendente = document.getElementById('kpi-total-pendente');
  const elQtd = document.getElementById('kpi-total-fornecedores');

  if (elContratado) elContratado.textContent = formatBRL(totalContratado);
  if (elPago) elPago.textContent = formatBRL(totalPago);
  if (elPendente) elPendente.textContent = formatBRL(totalPendente);
  if (elQtd) elQtd.textContent = String(allSuppliers.length);
}

/**
 * Renderiza a Tabela de Fornecedores aplicando filtros
 */
export function renderSuppliers() {
  const tbody = document.getElementById('suppliers-tbody');
  if (!tbody) return;

  const searchInput = document.getElementById('filter-supplier-search')?.value.toLowerCase().trim() || '';
  const statusFilter = document.getElementById('filter-supplier-status')?.value || 'all';
  const categoryFilter = document.getElementById('filter-supplier-category')?.value || 'all';

  const filtered = allSuppliers.filter(item => {
    const matchSearch = !searchInput || 
      (item.name && item.name.toLowerCase().includes(searchInput)) ||
      (item.contactName && item.contactName.toLowerCase().includes(searchInput)) ||
      (item.category && item.category.toLowerCase().includes(searchInput));

    const matchStatus = statusFilter === 'all' || item.paymentStatus === statusFilter;
    const matchCategory = categoryFilter === 'all' || item.category === categoryFilter;

    return matchSearch && matchStatus && matchCategory;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="empty-state">
          <div class="empty-box">
            <span class="empty-icon">📋</span>
            <p>Nenhum fornecedor ou lançamento encontrado com os filtros selecionados.</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(item => {
    const amountFmt = (Number(item.amount) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const dueDateFmt = item.dueDate ? new Date(item.dueDate + 'T00:00:00').toLocaleDateString('pt-BR') : '-';
    
    let statusClass = 'badge-pendente';
    if (item.paymentStatus === 'Quitado') statusClass = 'badge-quitado';
    if (item.paymentStatus === 'Parcial') statusClass = 'badge-parcial';

    return `
      <tr data-id="${item.id}">
        <td class="col-supplier">
          <strong>${escapeHtml(item.name)}</strong>
          <span class="sub-info">${escapeHtml(item.contactName || '-')} • ${escapeHtml(item.phone || '-')}</span>
        </td>
        <td><span class="category-pill">${escapeHtml(item.category || 'Outros')}</span></td>
        <td class="col-amount font-mono"><strong>${amountFmt}</strong></td>
        <td><span class="status-pill ${statusClass}">${item.paymentStatus}</span></td>
        <td class="font-mono text-muted">${dueDateFmt}</td>
        <td>
          <span class="text-xs text-muted" title="${escapeHtml(item.notes || 'Sem observações')}">
            ${item.notes ? (item.notes.length > 25 ? escapeHtml(item.notes.substring(0, 25)) + '...' : escapeHtml(item.notes)) : '-'}
          </span>
        </td>
        <td class="col-actions">
          <button class="btn-icon btn-edit" title="Editar" onclick="window.editSupplier('${item.id}')">✏️</button>
          ${isDirecao() ? `<button class="btn-icon btn-delete" title="Excluir" onclick="window.deleteSupplier('${item.id}')">🗑️</button>` : ''}
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Salva ou Atualiza um Fornecedor no Firestore e sincroniza com a Google Sheet
 */
export async function saveSupplier(formData) {
  const { doc, setDoc, addDoc, collection } = firestoreMethods;
  const user = getCurrentUser();
  const profile = getCurrentUserProfile();

  const supplierData = {
    name: formData.name.trim(),
    category: formData.category,
    contactName: formData.contactName.trim(),
    phone: formData.phone.trim(),
    amount: Number(formData.amount) || 0,
    paymentStatus: formData.paymentStatus,
    dueDate: formData.dueDate,
    paidDate: formData.paidDate || '',
    notes: formData.notes.trim(),
    fileUrl: formData.fileUrl ? formData.fileUrl.trim() : '',
    updatedAt: new Date().toISOString()
  };

  if (formData.id) {
    // Atualização
    supplierData.id = formData.id;
    const docRef = doc(firestoreDb, 'suppliers', formData.id);
    await setDoc(docRef, supplierData, { merge: true });
    
    // Atualiza localmente também
    const idx = allSuppliers.findIndex(s => s.id === formData.id);
    if (idx >= 0) allSuppliers[idx] = { ...allSuppliers[idx], ...supplierData };
  } else {
    // Novo Cadastro
    supplierData.createdBy = user ? user.uid : 'anon';
    supplierData.createdByName = profile ? (profile.name || profile.jobTitle) : 'Equipe APR';
    supplierData.createdAt = new Date().toISOString();

    const colRef = collection(firestoreDb, 'suppliers');
    const docRef = await addDoc(colRef, supplierData);
    supplierData.id = docRef.id;

    allSuppliers.unshift(supplierData);
  }

  // Disparo automático em tempo real para a Google Sheet (Looker Studio)
  syncSupplierToSheets(supplierData).catch(err => console.warn('Erro ao sincronizar Sheet:', err));

  renderSuppliers();
  updateFinancialKPIs();
  return supplierData;
}

/**
 * Exclui um fornecedor
 */
export async function deleteSupplier(supplierId) {
  if (!isDirecao()) {
    alert('Apenas membros da Direção podem excluir lançamentos financeiros.');
    return;
  }

  if (!confirm('Deseja realmente excluir este lançamento de fornecedor?')) {
    return;
  }

  try {
    const { doc, deleteDoc } = firestoreMethods;
    const docRef = doc(firestoreDb, 'suppliers', supplierId);
    await deleteDoc(docRef);

    allSuppliers = allSuppliers.filter(s => s.id !== supplierId);
    renderSuppliers();
    updateFinancialKPIs();
  } catch (err) {
    console.error('Erro ao excluir fornecedor:', err);
    alert('Erro ao excluir fornecedor: ' + err.message);
  }
}

export function getSupplierById(id) {
  return allSuppliers.find(s => s.id === id);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
