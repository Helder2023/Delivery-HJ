(function () {
  'use strict';

  // --- caminhos base ---
  const AUTH = '../sessao-admin/paginas/authentic/';
  const PAGINA = '../sessao-admin/paginas/';
  const CODIGOS_HTTPS = '../sessao-admin/paginas/codigos de status HTTPS/';
  const PERFIL = '../sessao-admin/administrador/perfil-admin/';
  const PEDIDOS = '../sessao-admin/paginas/pedidos/';
  const ADIMINISTRADOR = '../sessao-admin/administrador/';
  const UTILIZADOR = '../sessao-admin/utilizador/';
  const FINANCAS = '../sessao-admin/financas/';
  const RESTAURANTE = '../sessao-admin/restaurante/';
  const GERENCIAR_RESTAURANTE = '../sessao-admin/restaurante/gerenciar-restaurante/';
  const ENTREGADOR = '../sessao-admin/entregador/';
  const OPCOES = '../sessao-admin/opcoes/';
  const AVALIACOES = '../sessao-admin/opcoes/avaliacoes/';
  const MENSAGENS = '../sessao-admin/opcoes/mensagens/';
  const NOTIFICACOES = '../sessao-admin/opcoes/notificacoes/';
  const FERRAMENTAS = '../sessao-admin/ferramentas/';
  const ANUNCIOS = '../sessao-admin/paginas/anucios e publicidades/';
  const FOOTER = '../sessao-admin/paginas/footer/';
  const PARCEIRO = '../sessao-admin/parceiro/';


  // --- rotas ---
  const routes = {
    '/login': { title: 'Login', file: AUTH + 'login.html' },
    '/esqueceu-senha': { title: 'Esqueceu Senha', file: AUTH + 'forget-password.html' },
    '/nova-senha': { title: 'Nova Senha', file: AUTH + 'new-password.html' },
    '/-cadastro-superAdmin-': { title: 'Cadastrar Novo Administrador', file: AUTH + 'cadastro-superAdmin.html' },
    '/-cadastro-adminFinanceiro-': { title: 'Cadastrar Novo Administrador', file: AUTH + 'cadastro-adminFinanceiro.html' },
    '/-cadastro-editor-': { title: 'Cadastrar Novo Administrador', file: AUTH + 'cadastro-editor.html' },

    '/pub': { title: 'Anucios e Publicidades', file: ANUNCIOS + 'pub.html' },
    '/editar-pub': { title: 'Editando Anucio / Publicidade', file: ANUNCIOS + 'editar-pub.html' },

    '/home': { title: 'Home', file: PAGINA + 'home.html' },
    '/config': { title: 'Configuracao', file: PAGINA + 'config.html' },
    '/visitantes': { title: 'visitantes', file: PAGINA + 'visitantes.html' },
    '/notas': { title: 'Bloco de notas', file: PAGINA + 'bloco-notas.html' },
    '/-controlo-admin-': { title: 'Controlando os status do sistema completo', file: PAGINA + 'controlo.html' },

    '/404': { title: 'Erro 404', file: CODIGOS_HTTPS + '404.html' },
    '/manutencao': { title: 'Dashboard em manuntenção', file: CODIGOS_HTTPS + 'manutencao.html' },
    '/usuario-banido': { title: 'Usuário foi banido', file: CODIGOS_HTTPS + 'usuario-banido.html' },

    '/calendario': { title: 'Calendário', file: OPCOES + 'calendario.html' },
    '/reciclagem': { title: 'Reciclagem', file: OPCOES + 'reciclagem.html' },

    '/avaliacao': { title: 'Avalicao', file: AVALIACOES + 'avaliacoes.html' },
    '/visualizar-avaliacao': { title: 'Visualizar Avaliação', file: AVALIACOES + 'visualizar-avaliacao.html' },

    '/mensagem': { title: 'Todas as mensagens', file: MENSAGENS + 'mensagem.html' },
    '/visualizar-mensagem': { title: 'Visualizar Mensagem', file: MENSAGENS + 'visualizar-mensagem.html' },
    '/visualizar-reclamacoes': { title: 'Visualizar Reclamação', file: MENSAGENS + 'visualizar-reclamacoes.html' },

    '/notificacao': { title: 'Todas as notificação', file: NOTIFICACOES + 'notificacao.html' },
    '/visualizar-notificacao': { title: 'Visualizar Notificação', file: NOTIFICACOES + 'visualizar-notificacao.html' },


    '/pedidos': { title: 'Gerencia todos os pedidos dos retaurantes', file: PEDIDOS + 'pedidos.html' },
    '/visualizar-pedido': { title: 'Visualizando o pedido', file: PEDIDOS + 'visualizar-pedido.html' },

    '/perfil': { title: 'Perfil', file: PERFIL + 'perfil.html' },
    '/editar': { title: 'Editar Perfil', file: PERFIL + 'editar-perfil.html' },

    '/todos-admin': { title: 'Todos os administradores', file: ADIMINISTRADOR + 'todos-admins.html' },
    '/adicionar-admin': { title: 'Adicionar Administrador', file: ADIMINISTRADOR + 'adicionar-admin.html' },
    '/visualizar-admin': { title: 'Visualizar Administrador', file: ADIMINISTRADOR + 'visualizar-admin.html' },
    '/editar-admin': { title: 'Editar Administrador', file: ADIMINISTRADOR + 'editar-admin.html' },
    '/deletar-admin': { title: 'Editar Administrador', file: ADIMINISTRADOR + 'deletar-admin.html' },

    '/todos-utilizadores': { title: 'Todos os utilizador', file: UTILIZADOR + 'todos-utilizadores.html' },
    '/adicionar-utilizador': { title: 'Adicionar utilizador', file: UTILIZADOR + 'adicionar-utilizador.html' },
    '/visualizar-utilizador': { title: 'Visualizar utilizador', file: UTILIZADOR + 'visualizar-utilizador.html' },
    '/editar-utilizador': { title: 'Editar Utilizador', file: UTILIZADOR + 'editar-utilizador.html' },
    '/deletar-utilizador': { title: 'Editar Utilizador', file: UTILIZADOR + 'deletar-utilizador.html' },

    '/financas': { title: 'Finanças', file: FINANCAS + 'financas.html' },
    '/analisando': { title: 'Analisando', file: FINANCAS + 'analisando.html' },

    '/todos-entregadores': { title: 'Todos os entregadores', file: ENTREGADOR + 'todos-entregadores.html' },
    '/adicionar-entregador': { title: 'Adicionar entregador', file: ENTREGADOR + 'adicionar-entregador.html' },
    '/visualizar-entregador': { title: 'Visualizar entregador', file: ENTREGADOR + 'visualizar-entregador.html' },
    '/editar-entregador': { title: 'Editar Entregador', file: ENTREGADOR + 'editar-entregador.html' },
    '/deletar-entregador': { title: 'Editar Entregador', file: ENTREGADOR + 'deletar-entregador.html' },

    '/todos-restaurantes': { title: 'Todos os restaurantes', file: RESTAURANTE + 'todos-restaurantes.html' },
    '/adicionar-restaurante': { title: 'Adicionar restaurante', file: RESTAURANTE + 'adicionar-restaurante.html' },
    '/visulizar-restaurante': { title: 'Visualizando restaurante', file: RESTAURANTE + 'visualizar-restaurante.html' },
    '/deletar-restaurante': { title: 'Visualizando restaurante', file: RESTAURANTE + 'deletar-restaurante.html' },

    '/gerenciar-restaurante': { title: 'Gerenciar Restaurante', file: GERENCIAR_RESTAURANTE + 'gerenciar-retaurante.html' },
    '/gerenciar-editar-admin': { title: 'Editar Administrador', file: GERENCIAR_RESTAURANTE + 'gerenciar-editar-admin.html' },
    '/gerenciar-editar-entregador': { title: 'Editar Entregador', file: GERENCIAR_RESTAURANTE + 'gerenciar-editar-entregador.html' },

    '/backup': { title: 'Backup', file: FERRAMENTAS + 'backup.html' },
    '/exportar-dados-pessoais': { title: 'Exportar dados pessoais', file: FERRAMENTAS + 'exportar-dados-pessoais.html' },
    '/importar-dados': { title: 'Importar dados', file: FERRAMENTAS + 'importar-dados.html' },

    '/privacidade': { title: 'Pulíticas de Privacidade', file: FOOTER + 'privacidade.html' },
    '/termosDeUso': { title: 'Termos de Uso do Serviço', file: FOOTER + 'termos_uso.html' },
    '/suporte': { title: 'Caso tivier uma dúvica é só nos contar', file: FOOTER + 'suporte.html' },
    
    '/todos-parceiros': { title: 'Todos os administradores', file: PARCEIRO + 'todos-parceiro.html' },
    '/adicionar-parceiro': { title: 'Adicionar Administrador', file: PARCEIRO + 'adicionar-parceiro.html' },
    '/visualizar-parceiro': { title: 'Visualizar Administrador', file: PARCEIRO + 'visualizar-parceiro.html' },
    '/editar-parceiro': { title: 'Editar Administrador', file: PARCEIRO + 'editar-parceiro.html' },
    '/deletar-parceiro': { title: 'Editar Administrador', file: PARCEIRO + 'deletar-parceiro.html' },
  };


  const app = document.getElementById('app');
  if (!app) {
    console.error('router-hash: não encontrou <main id="app">.');
    return;
  }

  // --- normalização ---
  function normalizeToken(rawHash) {
    let token = rawHash || '';
    if (token.startsWith('#/')) token = token.slice(2);
    else token = token.replace(/^#/, '');
    token = token.replace(/\.html$|\.php$/i, '').replace(/\/$/, '');
    if (!token) token = 'login';
    return '/' + token;
  }

  function getFilenameFromPath(p) {
    if (!p) return '';
    return p.split('/').pop().toLowerCase();
  }

  // --- bootstrap reinit ---
  function reinitializeBootstrapComponents() {
    try {
      document.querySelectorAll('[data-bs-toggle="dropdown"]').forEach(el => new bootstrap.Dropdown(el));
      document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => new bootstrap.Tooltip(el));
      document.querySelectorAll('[data-bs-toggle="popover"]').forEach(el => new bootstrap.Popover(el));
      document.querySelectorAll('.offcanvas').forEach(el => new bootstrap.Offcanvas(el));
      document.querySelectorAll('.modal').forEach(el => new bootstrap.Modal(el));
      document.querySelectorAll('[data-bs-toggle="collapse"]').forEach(el => new bootstrap.Collapse(el, { toggle: false }));
    } catch (err) {
      console.warn('Bootstrap JS não pôde ser reinicializado:', err);
    }
  }

  function toggleInterface(visible) {
    document.querySelectorAll('.sidebar, .sidebar-content, .navbar').forEach(el => {
      el.style.display = visible ? '' : 'none';
    });
  }

  // --- carregar arquivo HTML ---
  async function loadFile(filePath, titleHint) {
    toggleInterface(false);
    app.innerHTML = `<div class="loading" style="
      display:flex;align-items:center;justify-content:center;height:80vh;font-size:1.1rem;color:#888;
    ">Carregando...</div>`;

    try {
      const res = await fetch(filePath, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Erro HTTP ${res.status}`);
      const html = await res.text();

      const temp = document.createElement('div');
      temp.innerHTML = html;

      // Corrigir caminhos relativos de imagens, links e scripts
      temp.querySelectorAll('img, script, link').forEach(el => {
        const attr = el.tagName === 'LINK' ? 'href' : 'src';

        if (el[attr] && !el[attr].startsWith('http') && !el[attr].startsWith('/') && !el[attr].startsWith('#')) {
          el[attr] = filePath.replace(/[^\/]+$/, '') + el[attr];
        }
      });


      const scripts = Array.from(temp.querySelectorAll('script'));
      scripts.forEach(s => s.remove());
      app.innerHTML = temp.innerHTML;

      window.dispatchEvent(new CustomEvent('pageLoaded', {
        detail: { filePath, title: titleHint }
      }));
      // Executar scripts da página
      for (const s of scripts) {
        if (s.src) {
          await new Promise(resolve => {
            const newScript = document.createElement('script');
            newScript.src = s.src;
            newScript.async = false;
            newScript.onload = newScript.onerror = () => resolve();
            document.body.appendChild(newScript);
          });
        } else {
          const inline = document.createElement('script');
          inline.textContent = s.textContent;
          document.body.appendChild(inline);
        }
      }

      // Recarregar dependências
      if (window.feather) feather.replace();
      reinitializeBootstrapComponents();
      initDataTablesFilters();
      initColumnSearchSelects();
      await loadPageScript();

      document.title = `DeliveryHJ | ${titleHint || 'Página'}`;
      updateActiveLinks(filePath);
      toggleInterface(true);
    }
    catch (err) {
      console.error('Erro ao carregar página:', filePath, err);
      const notFoundFile = routes['/404'] ? routes['/404'].file : (BASE_PATH + '404.html');
      if (filePath !== notFoundFile) {
        await loadFile(notFoundFile, 'Erro 404');
      } else {
        app.innerHTML = '<div style="padding:2rem;color:#900;">Erro ao carregar a página. Verifique o servidor.</div>';
        toggleInterface(true);
      }
    }
  }

  // --- marcar link ativo ---
  function updateActiveLinks(currentFile) {
    const currentFileName = getFilenameFromPath(currentFile);
    document.querySelectorAll('a[href^="#/"]').forEach(a => {
      const key = a.getAttribute('href').replace(/^#\//, '');
      const route = routes['/' + key];
      let isActive = false;
      if (route) {
        const routeFileName = getFilenameFromPath(route.file);
        isActive = (route.file === currentFile) || (routeFileName && routeFileName === currentFileName);
      }
      a.classList.toggle('active', isActive);
      const li = a.closest('.sidebar-item');
      if (li) li.classList.toggle('active', isActive);
    });
  }

  // --- DataTables base ---
  function initDataTablesFilters() {
    if (typeof $ === 'undefined' || !$.fn.DataTable) return;
    document.querySelectorAll('table.dataTable').forEach(tbl => {
      if (!$.fn.dataTable.isDataTable(tbl)) {
        $(tbl).DataTable({
          responsive: true,
          scrollX: true,
          language: { url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/pt-PT.json' }
        });
      }
    });
  }

  // --- DataTable com filtro em colunas ---
  function initColumnSearchSelects() {
    if (typeof $ === 'undefined' || !$.fn.DataTable) return;

    const tables = document.querySelectorAll('#datatables-column-search-select-inputs');
    tables.forEach(table => {
      if (!$.fn.dataTable.isDataTable(table)) {
        const dataTable = $(table).DataTable({
          responsive: true,
          scrollX: true,
          language: { url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/pt-PT.json' },
          initComplete: function () {
            this.api().columns().every(function () {
              const column = this;
              const select = $('<select><option value=""></option></select>')
                .appendTo($(column.footer()).empty())
                .on('change', function () {
                  const val = $.fn.dataTable.util.escapeRegex($(this).val());
                  column.search(val ? '^' + val + '$' : '', true, false).draw();
                });

              column.data().unique().sort().each(function (d) {
                select.append('<option value="' + d + '">' + d + '</option>');
              });
            });
          }
        });
      }
    });

  }


  // --- rota/hash ---
  async function loadHash() {
    const token = normalizeToken(location.hash);

    // Se houver tentativas de navegação inválida, redireciona para 404
    if (token.includes('..') || token.includes('://') || /[^a-zA-Z0-9\-\/]/.test(token)) {
      console.warn('Tentativa de navegação inválida bloqueada:', token);
      location.hash = '#/404';
      return await loadFile(routes['/404'].file, routes['/404'].title);
    }

    // Se a rota existe
    if (routes[token]) return await loadFile(routes[token].file, routes[token].title);

    // Tenta buscar arquivo baseado no caminho
    const filePath = BASE_PATH + token.slice(1) + '.html';
    try {
      const res = await fetch(filePath, { cache: 'no-store' });
      if (res.ok) return await loadFile(filePath, token.slice(1));
    } catch (err) { }

    // Se não encontrar, redireciona para 404
    location.hash = '#/404';
    return await loadFile(routes['/404'].file, routes['/404'].title);
  }



  document.addEventListener('DOMContentLoaded', () => {
    if (!location.hash || location.hash === '#' || location.hash === '#/') {
      location.hash = '#/login';
    } else {
      const clean = location.hash.replace(/\.html$|\.php$/i, '');
      if (clean !== location.hash) location.hash = clean;
    }
    // Não chama mais loadHash(), pois o reload cuidará disso
  });


  // --- script global ---
  async function loadPageScript() {
    try {
      const old = document.getElementById('page-script');
      if (old) old.remove();
      const script = document.createElement('script');
      script.src = '/app-js';
      script.id = 'page-script';
      script.defer = true;
      document.body.appendChild(script);
    } catch (err) {
      console.error('Erro ao carregar script da página:', err);
    }
  }

  // --- inicialização ---
  window.addEventListener('hashchange', loadHash);

  document.addEventListener('DOMContentLoaded', () => {
    if (!location.hash || location.hash === '#' || location.hash === '#/') {
      location.hash = '#/login';
    } else {
      const clean = location.hash.replace(/\.html$|\.php$/i, '');
      if (clean !== location.hash) location.hash = clean;
    }
    loadHash();
  });
})();

// ==============================
// 🌗 MODO CLARO / ESCURO ABSOLUTO - VERSÃO CORRIGIDA
// ==============================

function aplicarTema(tema) {
  document.body.classList.remove('light-mode', 'dark-mode');
  document.body.classList.add(`${tema}-mode`);
  localStorage.setItem('deliveryhj_tema', tema);

  atualizarCoresDeTexto(tema);
  atualizarCoresDosAlerts(tema);
  atualizarIconeTema(tema);
  preservarCoresLinksAtivos(tema); // NOVA FUNÇÃO
}

function preservarCoresLinksAtivos(tema) {
  // NÃO aplica cor aos links que já têm classe 'active'
  // Isso permite que o CSS mantenha suas próprias cores para links ativos
  document.querySelectorAll('a.active, .sidebar-item.active > a').forEach(link => {
    link.style.removeProperty('color');
    link.style.removeProperty('background-color');
  });

  // Também preserva badges dentro de links ativos
  document.querySelectorAll('a.active .badge, .sidebar-item.active .badge').forEach(badge => {
    badge.style.removeProperty('color');
    badge.style.removeProperty('background-color');
  });
}

function atualizarCoresDeTexto(tema) {
  const corTexto = tema === 'dark' ? '#ffffff' : '#000000';
  const corFundoCard = tema === 'dark' ? '#1f1f1f' : '#ffffff';
  const corBadgeTexto = tema === 'dark' ? '#ffffff' : '#000000';
  const corBadgeFundo = tema === 'dark' ? '#333333' : '#ffffff';
  const corDropdownFundo = tema === 'dark' ? '#1f1f1f' : '#ffffff';
  const corDropdownHover = tema === 'dark' ? '#2a2a2a' : '#f1f1f1';

  // 🔹 Seleciona elementos MAS EXCLUI LINKS ATIVOS
  const seletores = 'h1,h2,h3,h4,h5,h6,p,span,small,strong,em,b,i,th,td,button,label,div:not(.sidebar-item.active):not(.sidebar-item.active *),li:not(.sidebar-item.active):not(.sidebar-item.active *),blockquote,figcaption,.progress';

  // Aplica cor apenas aos elementos que NÃO estão dentro de um item ativo
  document.querySelectorAll(seletores)
    .forEach(el => {
      // Verifica se o elemento não é ou não está dentro de um link ativo
      if (!el.closest('.active') && !el.classList.contains('active')) {
        el.style.setProperty('color', corTexto, 'important');
      }
    });

  // 🔹 Links normais (não ativos)
  document.querySelectorAll('a:not(.active):not(.sidebar-item.active a)')
    .forEach(link => {
      link.style.setProperty('color', corTexto, 'important');
    });

  // 🔹 Cards
  document.querySelectorAll('.card, .card-dashboard')
    .forEach(card => card.style.setProperty('background-color', corFundoCard, 'important'));

  // 🔹 Badges (exceto dentro de links ativos)
  document.querySelectorAll('.badge:not(.active .badge), .indicator:not(.active .indicator), .badge-soft-dark:not(.active .badge-soft-dark), .badge-soft-success:not(.active .badge-soft-success), .badge-red:not(.active .badge-red), .badge-yellow:not(.active .badge-yellow), .badge-green:not(.active .badge-green)')
    .forEach(el => {
      el.style.setProperty('color', corBadgeTexto, 'important');
      el.style.setProperty('background-color', corBadgeFundo, 'important');
    });

  // 🔹 Dropdown menus e links (exceto ativos)
  document.querySelectorAll('.dropdown-menu').forEach(menu => {
    menu.style.setProperty('background-color', corDropdownFundo, 'important');
    menu.querySelectorAll('a:not(.active)').forEach(link => {
      link.style.setProperty('color', corTexto, 'important');
      link.addEventListener('mouseenter', () => link.style.backgroundColor = corDropdownHover);
      link.addEventListener('mouseleave', () => link.style.backgroundColor = corDropdownFundo);
    });
  });

  // 🔹 Ícones feather (exceto dentro de links ativos)
  document.querySelectorAll('svg.feather:not(.active svg.feather)')
    .forEach(svg => svg.style.setProperty('stroke', corTexto, 'important'));
}

// 🔹 Ajuste para alertas Bootstrap (mantém igual)
function atualizarCoresDosAlerts(tema) {
  document.querySelectorAll('.alert').forEach(alert => {
    let bg = '', text = '';
    if (tema === 'dark') {
      if (alert.classList.contains('alert-success')) { bg = '#204e28'; text = '#b6f7c5'; }
      else if (alert.classList.contains('alert-danger')) { bg = '#5a1e1e'; text = '#ffbdbd'; }
      else if (alert.classList.contains('alert-warning')) { bg = '#665c24'; text = '#fff7cc'; }
      else if (alert.classList.contains('alert-info')) { bg = '#1d3f5a'; text = '#b3e5ff'; }
      else { bg = '#2a2a2a'; text = '#ffffff'; }
    } else {
      if (alert.classList.contains('alert-success')) { bg = '#d1e7dd'; text = '#0f5132'; }
      else if (alert.classList.contains('alert-danger')) { bg = '#f8d7da'; text = '#842029'; }
      else if (alert.classList.contains('alert-warning')) { bg = '#fff3cd'; text = '#664d03'; }
      else if (alert.classList.contains('alert-info')) { bg = '#cff4fc'; text = '#055160'; }
      else { bg = '#f8f9fa'; text = '#000000'; }
    }
    alert.style.setProperty('background-color', bg, 'important');
    alert.style.setProperty('color', text, 'important');
    alert.style.setProperty('border-color', tema === 'dark' ? '#444' : '#ccc', 'important');
  });
}

function alternarTema() {
  const atual = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
  aplicarTema(atual === 'dark' ? 'light' : 'dark');
}

function atualizarIconeTema(tema) {
  const btn = document.getElementById('btn-tema');
  if (!btn) return;
  const icone = btn.querySelector('i');
  if (icone) {
    icone.setAttribute('data-feather', tema === 'dark' ? 'sun' : 'moon');
    if (window.feather) feather.replace();
  }
  btn.title = tema === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro';
}

function criarBotaoTema() {
  const nav = document.querySelector('.navbar');
  if (!nav || document.getElementById('btn-tema')) return;

  const btn = document.createElement('button');
  btn.id = 'btn-tema';
  btn.className = 'btn btn-sm ms-2 shadow-sm';
  btn.style.cssText = 'background-color:white;color:black;border-radius:8px;';
  btn.innerHTML = '<i data-feather="moon"></i>';
  btn.onclick = alternarTema;
  nav.appendChild(btn);
}

// MODIFICAÇÃO IMPORTANTE: Chamar preservarCoresLinksAtivos quando o tema muda
window.addEventListener('hashchange', () => {
  const temaAtual = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
  aplicarTema(temaAtual);
  setTimeout(criarBotaoTema, 300);
});

document.addEventListener('DOMContentLoaded', () => {
  const temaSalvo = localStorage.getItem('deliveryhj_tema') || 'dark';
  aplicarTema(temaSalvo);
  criarBotaoTema();

  // Garantir que os links ativos mantenham suas cores
  setTimeout(() => {
    preservarCoresLinksAtivos(temaSalvo);
  }, 100);
});
/**
 * Mostra um alerta dinamicamente na página.
 * @param {string} tipo - Tipo do alerta: 'success', 'danger', 'warning', 'info'
 * @param {string} mensagem - Conteúdo do alerta
 * @param {number} duracao - Opcional: tempo em ms antes de desaparecer. 0 ou undefined = não desaparece.
 */
function mostrarAlerta(tipo, mensagem, duracao = 0) {
  const containerId = 'alert-container';
  let container = document.getElementById(containerId);

  // Criar container se não existir
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    container.style.position = 'fixed';
    container.style.top = '1rem';
    container.style.right = '1rem';
    container.style.zIndex = 1055; // acima do Bootstrap modal
    container.style.width = '300px';
    container.style.maxWidth = '90vw';
    document.body.appendChild(container);
  }

  const alert = document.createElement('div');
  alert.className = `alert alert-${tipo} alert-dismissible fade show`;
  alert.role = 'alert';
  alert.innerHTML = `
    ${mensagem}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;

  // Aplica cores corretas para modo claro/escuro
  const tema = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
  let bg = '', text = '';
  if (tema === 'dark') {
    if (tipo === 'success') { bg = '#204e28'; text = '#000000ff'; }
    else if (tipo === 'danger') { bg = '#5a1e1e'; text = '#000000ff'; }
    else if (tipo === 'warning') { bg = '#665c24'; text = '#000000ff'; }
    else if (tipo === 'info') { bg = '#1d3f5a'; text = '#000000ff'; }
    else { bg = '#2a2a2a'; text = '#000000ff'; }
  } else {
    if (tipo === 'success') { bg = '#d1e7dd'; text = '#0f5132'; }
    else if (tipo === 'danger') { bg = '#f8d7da'; text = '#842029'; }
    else if (tipo === 'warning') { bg = '#fff3cd'; text = '#664d03'; }
    else if (tipo === 'info') { bg = '#cff4fc'; text = '#055160'; }
    else { bg = '#f8f9fa'; text = '#000000'; }
  }

  alert.style.setProperty('background-color', bg, 'important');
  alert.style.setProperty('color', text, 'important');
  alert.style.setProperty('border-color', tema === 'dark' ? '#444' : '#ccc', 'important');
  alert.style.marginBottom = '0.5rem';

  container.appendChild(alert);

  // Inicializa o dismiss do Bootstrap
  new bootstrap.Alert(alert);

  // Remover automaticamente se duracao > 0
  if (duracao > 0) {
    setTimeout(() => {
      alert.classList.remove('show');
      alert.classList.add('hide');
      setTimeout(() => alert.remove(), 200); // espera animação de fade
    }, duracao);
  }
}












// No final do seu arquivo router.js, adicione:

// Sistema de active state para sidebar
function updateSidebarActiveState() {
  const currentHash = normalizeToken(location.hash);

  // Remove active de todos
  document.querySelectorAll('#sidebar .sidebar-item, #sidebar a.sidebar-link').forEach(el => {
    el.classList.remove('active');
  });

  // Encontra o link correspondente
  const selector = `#sidebar a.sidebar-link[href*="${currentHash.replace(/^\//, '')}"]`;
  const matchingLink = document.querySelector(selector);

  if (matchingLink) {
    // Marca link como ativo
    matchingLink.classList.add('active');

    // Marca o item pai como ativo
    const parentItem = matchingLink.closest('.sidebar-item');
    if (parentItem) parentItem.classList.add('active');

    // Abre dropdowns pais
    const dropdown = matchingLink.closest('.sidebar-dropdown.collapse');
    if (dropdown) {
      const bsCollapse = bootstrap.Collapse.getInstance(dropdown) || new bootstrap.Collapse(dropdown);
      bsCollapse.show();

      // Marca o item dropdown pai como ativo
      const parentToggle = document.querySelector(`[data-bs-target="#${dropdown.id}"]`);
      if (parentToggle) {
        parentToggle.closest('.sidebar-item').classList.add('active');
      }
    }
  }
}

// Chama a função quando a hash muda e quando a página carrega
window.addEventListener('hashchange', updateSidebarActiveState);

// Modifique a função loadFile para chamar após carregar:
async function loadFile(filePath, titleHint) {
  // ... código existente ...

  // APÓS carregar com sucesso:
  setTimeout(updateSidebarActiveState, 50);

  // ... resto do código ...
}

// Atualiza estado inicial
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(updateSidebarActiveState, 100);
});


