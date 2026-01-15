// Cole este código no final do seu arquivo router.js
(function() {
  'use strict';
  
  console.log('Inicializando sistema de URLs limpas...');
  
  // Função para limpar hash
  function cleanHash(hash) {
    return hash
      .replace(/admin\.html#\//, '')
      .replace(/\.(html|php)/gi, '')
      .replace(/^#\/+/, '#/')
      .replace(/\/+$/, '');
  }
  
  // Limpa hash atual
  const currentHash = window.location.hash;
  const cleanedHash = cleanHash(currentHash);
  
  if (currentHash !== cleanedHash) {
    window.history.replaceState({}, '', cleanedHash);
    console.log('URL limpa:', currentHash, '→', cleanedHash);
  }
  
  // Intercepta clique em links
  document.addEventListener('click', function(e) {
    const link = e.target.closest('a[href*="#"]');
    if (link) {
      const href = link.getAttribute('href');
      if (href && (href.includes('admin.html#') || href.includes('.html'))) {
        e.preventDefault();
        
        const cleanHref = cleanHash(href);
        window.location.hash = cleanHref.replace(/^#/, '');
      }
    }
  });
  
  // Atualiza título da página com nome da rota
  function updateTitleFromHash() {
    const hash = window.location.hash.replace(/^#\//, '');
    if (hash && window.routes && window.routes['/' + hash]) {
      document.title = `CraveNow | ${window.routes['/' + hash].title}`;
    }
  }
  
  // Escuta mudanças de hash
  window.addEventListener('hashchange', function() {
    // Limpa hash se necessário
    const hash = window.location.hash;
    const cleaned = cleanHash(hash);
    if (hash !== cleaned) {
      window.history.replaceState({}, '', cleaned);
    }
    
    // Atualiza título
    updateTitleFromHash();
  });
  
  // Inicial
  updateTitleFromHash();
  
  console.log('Sistema de URLs limpas ativado!');
})();