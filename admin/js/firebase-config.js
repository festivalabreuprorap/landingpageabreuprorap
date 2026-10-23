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
  apiKey: "AIzaSyFestivalAbreuProRap2026KeyMock",
  authDomain: "abreuprorap-dashboard.firebaseapp.com",
  projectId: "abreuprorap-dashboard",
  storageBucket: "abreuprorap-dashboard.appspot.com",
  messagingSenderId: "109823456789",
  appId: "1:109823456789:web:abcdef123456789"
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
  return localStorage.getItem('apr_sheets_webhook_url') || '';
}

export function saveSheetsWebhookUrl(url) {
  localStorage.setItem('apr_sheets_webhook_url', url.trim());
}
