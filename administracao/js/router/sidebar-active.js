// ==============================================
// sidebar-active.js
// Sistema de Menu Ativo para Router
// ==============================================

(function() {
  'use strict';
  
  console.log('✅ Sidebar Active Manager carregado');
  
  // ⏳ Aguarda tudo carregar
  setTimeout(initSidebarActive, 300);
  
  function initSidebarActive() {
    console.log('🔄 Inicializando Sidebar Active...');
    
    // 1️⃣ Remove classes active antigas
    clearAllActive();
    
    // 2️⃣ Obtém rota atual
    const currentRoute = getCurrentRoute();
    console.log('📍 Rota atual:', currentRoute);
    
    // 3️⃣ Atualiza estado inicial
    updateActiveState(currentRoute);
    
    // 4️⃣ Configura listeners
    setupEventListeners();
  }
  
  // 🔍 Obtém rota atual do hash
  function getCurrentRoute() {
    let hash = window.location.hash;
    
    // Se não tem hash, assume login
    if (!hash || hash === '#' || hash === '#/') {
      return '/login';
    }
    
    // Remove # e .html
    hash = hash.replace(/^#/, '')
               .replace(/\.html$/, '');
    
    // Garante que comece com /
    if (!hash.startsWith('/')) {
      hash = '/' + hash;
    }
    
    return hash;
  }
  
  // 🧹 Limpa todas as classes active
  function clearAllActive() {
    // Remove de itens
    document.querySelectorAll('.sidebar-item').forEach(item => {
      item.classList.remove('active');
    });
    
    // Remove de links
    document.querySelectorAll('.sidebar-link').forEach(link => {
      link.classList.remove('active');
    });
    
    // Remove de dropdowns pais
    document.querySelectorAll('.sidebar-item > a[data-bs-toggle]').forEach(parent => {
      parent.classList.remove('active');
    });
  }
  
  // 🎯 Atualiza estado ativo baseado na rota
  function updateActiveState(route) {
    console.log('🎯 Atualizando estado para rota:', route);
    
    // Primeiro, limpa tudo
    clearAllActive();
    
    // Tenta encontrar link exato
    let found = tryExactMatch(route);
    
    // Se não encontrou, tenta match parcial
    if (!found) {
      found = tryPartialMatch(route);
    }
    
    // Se ainda não encontrou, mostra no console
    if (!found) {
      console.warn('⚠️ Nenhum item do sidebar corresponde à rota:', route);
    }
  }
  
  // 🔎 Busca match EXATO
  function tryExactMatch(route) {
    // Remove a barra inicial para busca
    const routeWithoutSlash = route.startsWith('/') ? route.substring(1) : route;
    
    // Procura por link com href contendo a rota
    const selector = `.sidebar-link[href*="${routeWithoutSlash}"]`;
    const links = document.querySelectorAll(selector);
    
    console.log('🔍 Procurando exato com selector:', selector, '- Encontrados:', links.length);
    
    for (let link of links) {
      const href = link.getAttribute('href');
      // Verifica se o href contém exatamente esta rota
      if (href && href.includes(`#/${routeWithoutSlash}`)) {
        markAsActive(link);
        console.log('✅ Match exato encontrado:', href);
        return true;
      }
    }
    
    return false;
  }
  
  // 🔎 Busca match PARCIAL (útil para rotas dinâmicas)
  function tryPartialMatch(route) {
    // Extrai o "nome" da rota (última parte)
    const routeParts = route.split('/');
    const routeName = routeParts[routeParts.length - 1];
    
    if (!routeName) return false;
    
    // Procura links que contenham este nome
    const links = document.querySelectorAll('.sidebar-link');
    
    for (let link of links) {
      const href = link.getAttribute('href');
      if (href && href.includes(routeName)) {
        // Verifica se não é um falso positivo
        const hrefRoute = href.split('#/')[1];
        if (hrefRoute && hrefRoute.includes(routeName)) {
          markAsActive(link);
          console.log('✅ Match parcial encontrado:', href);
          return true;
        }
      }
    }
    
    return false;
  }
  
  // 🎨 Marca elemento como ativo
  function markAsActive(linkElement) {
    if (!linkElement) return;
    
    // 1. Marca o link
    linkElement.classList.add('active');
    
    // 2. Marca o item pai (li.sidebar-item)
    const parentItem = linkElement.closest('.sidebar-item');
    if (parentItem) {
      parentItem.classList.add('active');
    }
    
    // 3. Se estiver dentro de um dropdown, abre-o
    const dropdown = linkElement.closest('.sidebar-dropdown.collapse');
    if (dropdown) {
      openParentDropdown(dropdown);
    }
    
    // 4. Se o link for um dropdown parent, marca-o também
    if (linkElement.hasAttribute('data-bs-toggle') && 
        linkElement.getAttribute('data-bs-toggle') === 'collapse') {
      linkElement.classList.add('active');
      const parentOfParent = linkElement.closest('.sidebar-item');
      if (parentOfParent) {
        parentOfParent.classList.add('active');
      }
    }
  }
  
  // 📂 Abre dropdown pai
  function openParentDropdown(dropdownElement) {
    if (!dropdownElement) return;
    
    const dropdownId = dropdownElement.id;
    if (!dropdownId) return;
    
    // Encontra o botão que controla este dropdown
    const toggleButton = document.querySelector(`[data-bs-target="#${dropdownId}"]`);
    
    if (toggleButton && !dropdownElement.classList.contains('show')) {
      // Usa Bootstrap para abrir
      if (typeof bootstrap !== 'undefined') {
        const collapse = new bootstrap.Collapse(dropdownElement, {
          toggle: false
        });
        collapse.show();
      } else {
        // Fallback se Bootstrap não estiver disponível
        dropdownElement.classList.add('show');
      }
      
      // Marca o botão pai como ativo
      const parentItem = toggleButton.closest('.sidebar-item');
      if (parentItem) {
        parentItem.classList.add('active');
        toggleButton.classList.add('active');
      }
    }
  }
  
  // 🎧 Configura listeners de eventos
  function setupEventListeners() {
    console.log('🎧 Configurando listeners...');
    
    // 1. Quando o hash muda (usuário navega)
    window.addEventListener('hashchange', function() {
      setTimeout(() => {
        const route = getCurrentRoute();
        updateActiveState(route);
      }, 100);
    });
    
    // 2. Quando clica em links do sidebar (para resposta imediata)
    document.querySelectorAll('.sidebar-link').forEach(link => {
      link.addEventListener('click', function() {
        // Pequeno delay para o router processar
        setTimeout(() => {
          const route = getCurrentRoute();
          updateActiveState(route);
        }, 50);
      });
    });
    
    // 3. Dispara evento personalizado quando router carrega página
    window.addEventListener('pageLoaded', function() {
      setTimeout(() => {
        const route = getCurrentRoute();
        updateActiveState(route);
      }, 150);
    });
    
    console.log('✅ Listeners configurados');
  }
  
  // 🌐 Torna funções disponíveis globalmente se necessário
  window.SidebarManager = {
    update: function() {
      const route = getCurrentRoute();
      updateActiveState(route);
    },
    getCurrentRoute: getCurrentRoute,
    clearAll: clearAllActive
  };
  
})();