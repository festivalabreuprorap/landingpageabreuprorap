/**
 * ==============================================================================
 * FESTIVAL ABREU PRO RAP 2026 - GOOGLE SHEETS API SYNC & LOOKER STUDIO CONNECTOR
 * ==============================================================================
 * Conta Principal: abreuprorap@gmail.com
 * 
 * INSTRUÇÕES DE INSTALAÇÃO NO GOOGLE SHEETS:
 * 1. Abra sua planilha de Orçamento/Fornecedores no Google Drive (abreuprorap@gmail.com).
 * 2. No menu superior, clique em: Extensões > Apps Script.
 * 3. Cole todo este código no editor (substituindo o que estiver lá).
 * 4. Clique em "Salvar" (ícone de disquete).
 * 5. Clique em "Implantar" (Deploy) > "Nova implantação".
 * 6. Selecione o tipo "App da Web" (Web App).
 * 7. Em "Executar como", marque: "Eu (abreuprorap@gmail.com)".
 * 8. Em "Quem pode acessar", selecione: "Qualquer pessoa" (Anyone).
 * 9. Clique em "Implantar", autorize o acesso da sua conta e COPIE A URL DO WEB APP.
 * 10. Cole essa URL no painel administrativo do Festival Abreu pro Rap (Configurações / Sheets Sync).
 */

const SHEET_NAME = 'Fornecedores_Looker';

// Cabeçalhos padronizados para alimentar o Looker Studio
const HEADERS = [
  'ID do Lançamento',
  'Fornecedor / Razão Social',
  'Categoria',
  'Pessoa de Contato',
  'Telefone',
  'Valor Contratado (R$)',
  'Status de Pagamento',
  'Data de Vencimento',
  'Data de Pagamento',
  'Observações',
  'Cadastrado Por',
  'Data do Cadastro',
  'Link do Contrato'
];

/**
 * Inicializa a aba com formatação profissional caso ainda não exista
 */
function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  
  // Se a primeira linha estiver vazia, cria os cabeçalhos
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    
    // Estilização Street/Festival nos cabeçalhos
    const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setBackground('#0f172a'); // Slate escuro
    headerRange.setFontColor('#fbbf24'); // Âmbar Dourado Hip Hop
    headerRange.setFontWeight('bold');
    headerRange.setFontFamily('Arial');
    headerRange.setHorizontalAlignment('center');
    sheet.setFrozenRows(1);
    
    // Formatação de coluna de moeda (Coluna F: Valor Contratado)
    sheet.getRange('F2:F').setNumberFormat('R$ #,##0.00');
    // Formatação de colunas de data (Colunas H, I, L)
    sheet.getRange('H2:H').setNumberFormat('dd/MM/yyyy');
    sheet.getRange('I2:I').setNumberFormat('dd/MM/yyyy');
    sheet.getRange('L2:L').setNumberFormat('dd/MM/yyyy HH:mm:ss');
  }
  
  return sheet;
}

/**
 * Endpoint POST que recebe os lançamentos do Dashboard
 */
function doPost(e) {
  try {
    const sheet = setupSheet();
    const data = JSON.parse(e.postData.contents);
    
    // Tratamento de sincronização em lote (Bulk Sync) ou registro único
    const records = Array.isArray(data) ? data : (data.records || [data]);
    
    // Mapeia os IDs existentes na coluna A
    const lastRow = sheet.getLastRow();
    const existingIds = lastRow > 1 
      ? sheet.getRange(2, 1, lastRow - 1, 1).getValues().map(row => String(row[0]))
      : [];
      
    let insertedCount = 0;
    let updatedCount = 0;
    
    records.forEach(item => {
      const id = String(item.id || Utilities.getUuid());
      const rowData = [
        id,
        item.name || '',
        item.category || 'Outros',
        item.contactName || '',
        item.phone || '',
        Number(item.amount) || 0,
        item.paymentStatus || 'Pendente',
        item.dueDate ? Utilities.formatDate(new Date(item.dueDate), Session.getScriptTimeZone(), 'yyyy-MM-dd') : '',
        item.paidDate ? Utilities.formatDate(new Date(item.paidDate), Session.getScriptTimeZone(), 'yyyy-MM-dd') : '',
        item.notes || '',
        item.createdByName || item.createdBy || 'Sistema',
        item.createdAt ? Utilities.formatDate(new Date(item.createdAt), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss') : Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss'),
        item.fileUrl || ''
      ];
      
      const existingIndex = existingIds.indexOf(id);
      
      if (existingIndex >= 0) {
        // Atualiza a linha existente (somando 2 por causa do header e índice 0)
        sheet.getRange(existingIndex + 2, 1, 1, rowData.length).setValues([rowData]);
        updatedCount++;
      } else {
        // Adiciona nova linha
        sheet.appendRow(rowData);
        existingIds.push(id);
        insertedCount++;
      }
    });
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      inserted: insertedCount,
      updated: updatedCount,
      total: sheet.getLastRow() - 1,
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Endpoint GET para testar a conexão do Dashboard
 */
function doGet(e) {
  const sheet = setupSheet();
  const total = Math.max(0, sheet.getLastRow() - 1);
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'online',
    project: 'Festival Abreu pro Rap 2026 - Looker Connector',
    account: 'abreuprorap@gmail.com',
    totalRecords: total
  })).setMimeType(ContentService.MimeType.JSON);
}
