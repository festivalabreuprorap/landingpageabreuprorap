/**
 * ==============================================================================
 * FESTIVAL ABREU PRO RAP 2026 - MÓDULO C: GERENCIAMENTO DE USUÁRIOS & PERMISSÕES
 * Exclusivo para Membros da Direção (RBAC)
 * ==============================================================================
 */

import { isDirecao } from './auth.js';

let allUsers = [];
let firestoreDb = null;
let firestoreMethods = null;
let unsubscribeUsers = null;

export function initUsers(db, methods) {
  firestoreDb = db;
  firestoreMethods = methods;
  subscribeToUsers();
}

/**
 * Escuta a coleção 'users' em tempo real
 */
function subscribeToUsers() {
  if (!isDirecao()) return;
  if (unsubscribeUsers) unsubscribeUsers();

  const { collection, onSnapshot, query, orderBy } = firestoreMethods;
  const usersRef = collection(firestoreDb, 'users');
  const q = query(usersRef, orderBy('createdAt', 'desc'));

  unsubscribeUsers = onSnapshot(q, (snapshot) => {
    allUsers = [];
    snapshot.forEach(doc => {
      allUsers.push({ uid: doc.id, ...doc.data() });
    });
    renderUsers();
  }, (err) => {
    console.error('[Users] Erro ao buscar lista de usuários:', err);
    if (allUsers.length === 0) {
      loadFallbackUsers();
    }
  });
}

function loadFallbackUsers() {
  allUsers = [
    {
      uid: 'user-master-01',
      name: 'Direção Geral Abreu pro Rap',
      email: 'abreuprorap@gmail.com',
      role: 'direcao',
      jobTitle: 'Diretor Geral & Fundador',
      permissions: { fornecedores: true, branding: true, admin: true },
      createdAt: '2026-01-20T00:00:00Z'
    },
    {
      uid: 'user-prod-02',
      name: 'Coordenação de Palco & Som',
      email: 'producao@festivalapr.com.br',
      role: 'gestor',
      jobTitle: 'Coordenador Técnico de Palco',
      permissions: { fornecedores: true, branding: false, admin: false },
      createdAt: '2026-02-15T00:00:00Z'
    },
    {
      uid: 'user-comms-03',
      name: 'Equipe de Comunicação & Mídia',
      email: 'comunicacao@festivalapr.com.br',
      role: 'gestor',
      jobTitle: 'Gestor de Identidade & Redes',
      permissions: { fornecedores: false, branding: true, admin: false },
      createdAt: '2026-03-01T00:00:00Z'
    }
  ];
  renderUsers();
}

export function renderUsers() {
  const tbody = document.getElementById('users-tbody');
  if (!tbody) return;

  if (allUsers.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">
          <div class="empty-box">
            <span class="empty-icon">👥</span>
            <p>Nenhum usuário cadastrado no momento.</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = allUsers.map(u => {
    const isMaster = u.email === 'abreuprorap@gmail.com' || u.role === 'direcao';
    const perms = u.permissions || {};

    return `
      <tr data-uid="${u.uid}">
        <td>
          <div class="user-cell">
            <div class="user-avatar-mini">${(u.name || u.email).substring(0, 2).toUpperCase()}</div>
            <div>
              <strong>${escapeHtml(u.name || 'Sem nome')}</strong>
              <span class="sub-info">${escapeHtml(u.email)}</span>
            </div>
          </div>
        </td>
        <td>
          <span class="job-title-badge">
            💼 ${escapeHtml(u.jobTitle || 'Não especificado')}
          </span>
        </td>
        <td>
          <span class="role-badge ${isMaster ? 'role-direcao' : 'role-gestor'}">
            ${isMaster ? 'DIREÇÃO' : 'EQUIPE'}
          </span>
        </td>
        <td>
          <div class="permissions-chips">
            <span class="perm-chip ${perms.fornecedores ? 'active' : ''}" title="Gestão de Fornecedores">
              💰 Fornecedores
            </span>
            <span class="perm-chip ${perms.branding ? 'active' : ''}" title="Drive de Marca">
              🎨 Branding
            </span>
            <span class="perm-chip ${perms.admin ? 'active' : ''}" title="Gerenciamento de Equipe">
              ⚡ Admin
            </span>
          </div>
        </td>
        <td class="font-mono text-muted text-xs">
          ${u.createdAt ? new Date(u.createdAt).toLocaleDateString('pt-BR') : '-'}
        </td>
        <td class="col-actions">
          <button class="btn-icon btn-edit" title="Editar Cargo e Permissões" onclick="window.editUser('${u.uid}')">✏️</button>
          ${u.email !== 'abreuprorap@gmail.com' ? `<button class="btn-icon btn-delete" title="Remover" onclick="window.deleteUser('${u.uid}')">🗑️</button>` : ''}
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Salva ou atualiza um usuário na coleção 'users'
 */
export async function saveUser(userData) {
  if (!isDirecao()) {
    throw new Error('Permissão negada. Apenas a Direção pode gerenciar usuários.');
  }

  const { doc, setDoc } = firestoreMethods;
  const uid = userData.uid || 'user-' + Date.now();
  const docRef = doc(firestoreDb, 'users', uid);

  const payload = {
    uid,
    name: userData.name.trim(),
    email: userData.email.trim().toLowerCase(),
    role: userData.role || 'gestor',
    jobTitle: userData.jobTitle.trim() || 'Membro da Equipe',
    permissions: {
      fornecedores: !!userData.permissions?.fornecedores,
      branding: !!userData.permissions?.branding,
      admin: userData.role === 'direcao' || !!userData.permissions?.admin
    },
    updatedAt: new Date().toISOString()
  };

  if (!userData.uid) {
    payload.createdAt = new Date().toISOString();
  }

  await setDoc(docRef, payload, { merge: true });

  const idx = allUsers.findIndex(u => u.uid === uid);
  if (idx >= 0) {
    allUsers[idx] = { ...allUsers[idx], ...payload };
  } else {
    allUsers.unshift(payload);
  }

  renderUsers();
  return payload;
}

export function getUserById(uid) {
  return allUsers.find(u => u.uid === uid);
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
