/**
 * ==============================================================================
 * FESTIVAL ABREU PRO RAP 2026 - AUTENTICAÇÃO & CONTROLE DE ACESSO (RBAC)
 * ==============================================================================
 */

let currentUser = null;
let currentUserProfile = null;

export function getCurrentUser() {
  return currentUser;
}

export function getCurrentUserProfile() {
  return currentUserProfile;
}

export function isDirecao() {
  return currentUserProfile?.role === 'direcao' || currentUser?.email === 'abreuprorap@gmail.com';
}

export function hasPermission(module) {
  if (isDirecao()) return true;
  return !!(currentUserProfile?.permissions && currentUserProfile.permissions[module] === true);
}

/**
 * Inicializa a observação de autenticação e validação do perfil no Firestore
 */
export function setupAuth({ auth, db, doc, getDoc, setDoc, onAuthStateChanged }, onStateChange) {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUser = user;
      
      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          currentUserProfile = userSnap.data();
        } else {
          // Auto-bootstrap para a conta principal do festival
          const isMaster = user.email.toLowerCase() === 'abreuprorap@gmail.com';
          currentUserProfile = {
            uid: user.uid,
            name: user.displayName || (isMaster ? 'Direção Abreu pro Rap' : user.email.split('@')[0]),
            email: user.email,
            role: isMaster ? 'direcao' : 'gestor',
            jobTitle: isMaster ? 'Diretor Geral do Festival' : 'Membro da Equipe',
            permissions: {
              fornecedores: true,
              branding: true,
              admin: isMaster
            },
            createdAt: new Date().toISOString()
          };

          // Salva no Firestore
          await setDoc(userRef, currentUserProfile);
        }
      } catch (err) {
        console.error('[Auth] Erro ao carregar perfil do Firestore:', err);
        // Fallback seguro em caso de indisponibilidade momentânea
        currentUserProfile = {
          uid: user.uid,
          name: user.displayName || user.email.split('@')[0],
          email: user.email,
          role: user.email === 'abreuprorap@gmail.com' ? 'direcao' : 'gestor',
          jobTitle: user.email === 'abreuprorap@gmail.com' ? 'Diretor Geral do Festival' : 'Gestor',
          permissions: {
            fornecedores: true,
            branding: true,
            admin: user.email === 'abreuprorap@gmail.com'
          }
        };
      }

      updateUserUI();
      if (onStateChange) onStateChange(true, currentUserProfile);
    } else {
      currentUser = null;
      currentUserProfile = null;
      if (onStateChange) onStateChange(false, null);
    }
  });
}

/**
 * Atualiza os elementos visuais do usuário na Sidebar e Header
 */
export function updateUserUI() {
  if (!currentUserProfile) return;

  const nameEl = document.getElementById('user-display-name');
  const roleEl = document.getElementById('user-role-badge');
  const jobTitleEl = document.getElementById('user-job-title');
  const avatarInitialsEl = document.getElementById('user-avatar-initials');

  if (nameEl) nameEl.textContent = currentUserProfile.name || currentUser.email;
  if (roleEl) {
    roleEl.textContent = isDirecao() ? 'DIREÇÃO' : 'EQUIPE';
    roleEl.className = `role-badge ${isDirecao() ? 'role-direcao' : 'role-gestor'}`;
  }
  if (jobTitleEl) {
    jobTitleEl.textContent = currentUserProfile.jobTitle || 'Membro da Equipe';
  }
  if (avatarInitialsEl) {
    const initials = (currentUserProfile.name || currentUser.email)
      .split(' ')
      .map(p => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
    avatarInitialsEl.textContent = initials || 'AP';
  }

  // Controle de visibilidade de itens de menu baseado em RBAC
  const navSuppliers = document.getElementById('nav-suppliers');
  const navBranding = document.getElementById('nav-branding');
  const navUsers = document.getElementById('nav-users');

  if (navSuppliers) navSuppliers.style.display = hasPermission('fornecedores') ? 'flex' : 'none';
  if (navBranding) navBranding.style.display = hasPermission('branding') ? 'flex' : 'none';
  if (navUsers) navUsers.style.display = isDirecao() ? 'flex' : 'none';
}
