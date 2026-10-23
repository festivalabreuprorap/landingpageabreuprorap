/**
 * ==============================================================================
 * FESTIVAL ABREU PRO RAP 2026 - MÓDULO B: GESTÃO DE BRANDING & IDENTIDADE VISUAL
 * ==============================================================================
 */

// Paleta Oficial do Festival
export const OFFICIAL_COLORS = [
  { name: 'Dourado Hip Hop', hex: '#F59E0B', rgb: '245, 158, 11', desc: 'Cor primária de destaque e premiação' },
  { name: 'Amarelo Urbano', hex: '#EAB308', rgb: '234, 179, 8', desc: 'Acentos e chamadas para ação' },
  { name: 'Preto Grafite', hex: '#0C0C0E', rgb: '12, 12, 14', desc: 'Fundo principal (Dark Mode)' },
  { name: 'Cinza Asfalto', hex: '#18181B', rgb: '24, 24, 27', desc: 'Superfícies de cards e caixas' },
  { name: 'Slate Concreto', hex: '#334155', rgb: '51, 65, 85', desc: 'Bordas e elementos neutros' },
  { name: 'Branco Tag', hex: '#FFFFFF', rgb: '255, 255, 255', desc: 'Tipografia de alto contraste e stickers' }
];

// Tipografias Oficiais
export const OFFICIAL_FONTS = [
  { name: 'Amsterdam Urban', file: '../amsterdam.ttf', format: 'TTF', type: 'Exibições & Cartazes', previewText: 'ABREU PRO RAP 2026' },
  { name: 'CC Phat Boi Bold', file: '../ccphatboi-bold.ttf', format: 'TTF', type: 'Graffiti & Títulos Pesados', previewText: 'HIP HOP EM AÇÃO' },
  { name: 'Rolinho Graffiti', file: '../rolinho.ttf', format: 'TTF', type: 'Texturas & Stencil Urbano', previewText: 'BATALHA DE RIMAS' },
  { name: 'Bebas Neue', web: 'Google Fonts', format: 'WebFont', type: 'Subtítulos & Menus', previewText: 'FESTIVAL DA JUVENTUDE' },
  { name: 'Inter Display', web: 'Google Fonts', format: 'WebFont', type: 'Corpo de Texto & UI', previewText: 'Transformação social através da arte urbana' }
];

// Logotipos Oficiais
export const OFFICIAL_LOGOS = [
  { name: 'Logotipo Dark Mode (Oficial)', file: '../logo-dark.svg', type: 'Vetor SVG', desc: 'Ideal para fundos escuros e telões de palco' },
  { name: 'Logotipo Light Mode', file: '../logo-light.svg', type: 'Vetor SVG', desc: 'Ideal para fundos claros e impressos' },
  { name: 'Símbolo & Favicon APR', file: '../fav.svg', type: 'Vetor SVG', desc: 'Ícone oficial para redes sociais e avatares' },
  { name: 'Logo Mic Aberto', file: '../MIC ABERTO LOGO.png', type: 'Imagem PNG', desc: 'Identidade oficial do Palco Mic Aberto' },
  { name: 'Brush Tag Spray', file: '../Brush tag spray.svg', type: 'Vetor SVG', desc: 'Pincelada de spray para composição visual' },
  { name: 'Splater Tag Spray', file: '../Splater Tag Spray.svg', type: 'Vetor SVG', desc: 'Respingos urbanos para identidade cenográfica' }
];

export function initBranding() {
  renderColorPalette();
  renderFontsList();
  renderLogosGrid();
}

function renderColorPalette() {
  const container = document.getElementById('palette-container');
  if (!container) return;

  container.innerHTML = OFFICIAL_COLORS.map(c => `
    <div class="color-card" onclick="window.copyColor('${c.hex}', '${c.name}')">
      <div class="color-swatch" style="background-color: ${c.hex}; border: 1px solid rgba(255,255,255,0.1);"></div>
      <div class="color-details">
        <strong>${c.name}</strong>
        <span class="color-code font-mono">${c.hex}</span>
        <span class="color-desc">${c.desc}</span>
        <button class="btn-copy-color" title="Copiar HEX">Copiar HEX</button>
      </div>
    </div>
  `).join('');
}

function renderFontsList() {
  const container = document.getElementById('fonts-container');
  if (!container) return;

  container.innerHTML = OFFICIAL_FONTS.map(f => `
    <div class="font-card">
      <div class="font-header">
        <div>
          <h4>${f.name}</h4>
          <span class="font-type">${f.type} • ${f.format}</span>
        </div>
        ${f.file ? `<a href="${f.file}" download class="btn-download-asset">⬇️ Baixar Fonte</a>` : `<span class="badge-webfont">WebFont Ativa</span>`}
      </div>
      <div class="font-sample">
        <p>${f.previewText}</p>
      </div>
    </div>
  `).join('');
}

function renderLogosGrid() {
  const container = document.getElementById('logos-container');
  if (!container) return;

  container.innerHTML = OFFICIAL_LOGOS.map(l => `
    <div class="logo-card">
      <div class="logo-preview-box">
        <img src="${l.file}" alt="${l.name}" loading="lazy" />
      </div>
      <div class="logo-info">
        <strong>${l.name}</strong>
        <span class="badge-filetype">${l.type}</span>
        <p class="logo-desc">${l.desc}</p>
        <a href="${l.file}" download class="btn-download-logo">⬇️ Download do Arquivo</a>
      </div>
    </div>
  `).join('');
}

export function copyToClipboard(text, label) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(`Código ${text} (${label}) copiado para a área de transferência!`);
  }).catch(() => {
    alert(`Código: ${text}`);
  });
}

function showToast(message) {
  let toast = document.getElementById('admin-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'admin-toast';
    toast.className = 'admin-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}
