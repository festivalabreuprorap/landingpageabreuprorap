/**
 * ==============================================================================
 * FESTIVAL ABREU PRO RAP 2026 - FIREBASE CONFIGURATION
 * ==============================================================================
 * Serviços utilizados:
 * - Firebase Authentication (Login de membros e Direção)
 * - Cloud Firestore (Banco de dados de Usuários, Fornecedores e Branding)
 * - Firebase Storage (Armazenamento de comprovantes e arquivos da marca)
 * 
 * Conta Principal do Projeto: abreuprorap@gmail.com
 */

// Chaves padrão do projeto (podem ser personalizadas via localStorage ou painel de configurações)
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyB6Gtzfl1PPXJ2EPappAEXCyWmm3hC4Lfg",
  authDomain: "festival-apr-dashboard.firebaseapp.com",
  projectId: "festival-apr-dashboard",
  storageBucket: "festival-apr-dashboard.firebasestorage.app",
  messagingSenderId: "536120338256",
  appId: "1:536120338256:web:68757b39ea456ffd1dae55",
  measurementId: "G-KNFPGXEFPN"
};

// Permite persistir credenciais customizadas sem alterar código fonte
export function getFirebaseConfig() {
  try {
    const saved = localStorage.getItem('apr_firebase_config');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Erro ao carregar credenciais do localStorage:', e);
  }
  return window.FIREBASE_CONFIG || DEFAULT_FIREBASE_CONFIG;
}

export function saveFirebaseConfig(config) {
  localStorage.setItem('apr_firebase_config', JSON.stringify(config));
}

// Configuração do Webhook da Google Sheets API para Looker Studio
export function getSheetsWebhookUrl() {
  return localStorage.getItem('apr_sheets_webhook_url') || "https://script.google.com/macros/s/AKfycbw7bkGrG1DYf8cQ6-Z7TceAv7FAF3oJZ1VVcoKnaXGNVZYDe_-OclrbvdPabIzF6-bPWQ/exec";
}

export function saveSheetsWebhookUrl(url) {
  localStorage.setItem('apr_sheets_webhook_url', url.trim());
}
