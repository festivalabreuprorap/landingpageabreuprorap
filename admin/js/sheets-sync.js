import { getSheetsWebhookUrl } from './firebase-config.js';

/**
 * Envia um lançamento individual de fornecedor para a Google Sheet (Looker Studio)
 */
export async function syncSupplierToSheets(supplier) {
  const webhookUrl = getSheetsWebhookUrl();
  if (!webhookUrl) {
    console.warn('[Sheets Sync] URL do Webhook do Google Sheets não configurada.');
    return { success: false, reason: 'no_url' };
  }

  try {
    const payload = {
      id: supplier.id,
      name: supplier.name,
      category: supplier.category,
      contactName: supplier.contactName,
      phone: supplier.phone,
      amount: supplier.amount,
      paymentStatus: supplier.paymentStatus,
      dueDate: supplier.dueDate,
      paidDate: supplier.paidDate || '',
      notes: supplier.notes || '',
      createdBy: supplier.createdBy,
      createdByName: supplier.createdByName || '',
      createdAt: supplier.createdAt || new Date().toISOString(),
      fileUrl: supplier.fileUrl || ''
    };

    // Envio com modo 'no-cors' suportado pelo Google Apps Script
    await fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log('[Sheets Sync] Lançamento sincronizado com sucesso com a Google Sheet!');
    return { success: true };
  } catch (error) {
    console.error('[Sheets Sync] Erro ao sincronizar com Google Sheets:', error);
    return { success: false, error };
  }
}

/**
 * Sincroniza toda a lista de fornecedores em lote para reconstruir a planilha do Looker Studio
 */
export async function syncAllSuppliersToSheets(suppliers) {
  const webhookUrl = getSheetsWebhookUrl();
  if (!webhookUrl) {
    return { success: false, reason: 'no_url' };
  }

  try {
    const payload = suppliers.map(s => ({
      id: s.id,
      name: s.name,
      category: s.category,
      contactName: s.contactName,
      phone: s.phone,
      amount: s.amount,
      paymentStatus: s.paymentStatus,
      dueDate: s.dueDate,
      paidDate: s.paidDate || '',
      notes: s.notes || '',
      createdBy: s.createdBy,
      createdByName: s.createdByName || '',
      createdAt: s.createdAt || new Date().toISOString(),
      fileUrl: s.fileUrl || ''
    }));

    await fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    return { success: true, count: suppliers.length };
  } catch (error) {
    console.error('[Sheets Sync] Erro no sincronismo em lote:', error);
    return { success: false, error };
  }
}
