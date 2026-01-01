// ==============================================
// sidebar-active.js - VERSÃO PRODUÇÃO SEGURA
// Sistema de Menu Ativo com Resiliência
// ==============================================

(function() {
    'use strict';
    
    // Configurações
    const CONFIG = {
        debug: false, // Desative em produção
        maxRetries: 3,
        retryDelay: 500,
        animationDuration: 300,
        sidebarSelectors: {
            items: '.sidebar-item',
            links: '.sidebar-link, .nav-link',
            dropdowns: '.sidebar-dropdown.collapse',
            toggleButtons: '[data-bs-toggle="collapse"]'
        }
    };
    
    // Sistema de logging controlado
    const logger = {
        log: (msg, data) => CONFIG.debug && console.log(`[Sidebar] ${msg}`, data || ''),
        warn: (msg, data) => console.warn(`[Sidebar] ⚠️ ${msg}`, data || ''),
        error: (msg, data) => console.error(`[Sidebar] 🔴 ${msg}`, data || ''),
        debug: (msg, data) => CONFIG.debug && console.debug(`[Sidebar] ${msg}`, data || '')
    };
    
    // Estado da aplicação
    const STATE = {
        isInitialized: false,
        isProcessing: false,
        retryCount: 0,
        lastRoute: null,
        activeElements: new Set()
    };
    
    // Verificação de elementos DOM
    function checkDOMRequirements() {
        const requirements = [
            { selector: CONFIG.sidebarSelectors.items, required: false, name: 'sidebar items' },
            { selector: CONFIG.sidebarSelectors.links, required: true, name: 'sidebar links' }
        ];
        
        const results = requirements.map(req => {
            const elements = document.querySelectorAll(req.selector);
            const exists = elements.length > 0;
            
            if (req.required && !exists) {
                logger.error(`${req.name} não encontrados`);
                return false;
            }
            
            logger.debug(`${req.name}: ${elements.length} encontrados`);
            return exists;
        });
        
        return results.every(result => result !== false);
    }
    
    // Extrai rota de forma segura
    function getCurrentRoute() {
        try {
            let hash = window.location.hash;
            
            // Rota padrão se não houver hash válido
            if (!hash || hash === '#' || hash === '#/') {
                return '/login';
            }
            
            // Limpa hash
            hash = hash.replace(/^#+/, '');
            
            // Remove extensões, query strings e fragmentos internos
            hash = hash.replace(/\.[^.]+$/, '')  // Remove .html, .php, etc
                      .replace(/\?.*$/, '')      // Remove query strings
                      .replace(/#.*$/, '')       // Remove fragmentos internos
                      .replace(/\/$/, '');       // Remove barra final
            
            // Garante que comece com /
            if (!hash.startsWith('/')) {
                hash = '/' + hash;
            }
            
            return hash;
            
        } catch (error) {
            logger.error('Erro ao extrair rota:', error);
            return '/login';
        }
    }
    
    // Limpeza segura
    function clearActiveStates() {
        try {
            // Remove de todos os elementos possíveis
            const selectors = [
                CONFIG.sidebarSelectors.items,
                CONFIG.sidebarSelectors.links,
                CONFIG.sidebarSelectors.toggleButtons
            ].join(', ');
            
            document.querySelectorAll(selectors).forEach(element => {
                element.classList.remove('active');
                STATE.activeElements.delete(element);
            });
            
            logger.debug('Estados ativos limpos');
            
        } catch (error) {
            logger.warn('Erro ao limpar estados ativos:', error);
        }
    }
    
    // Sistema de matching robusto
    class RouteMatcher {
        constructor() {
            this.cache = new Map();
        }
        
        // Normaliza rota para matching
        normalizeRoute(route) {
            if (!route) return '';
            
            return route.toLowerCase()
                .replace(/^\/+/, '')      // Remove barras iniciais
                .replace(/\/+$/, '')      // Remove barras finais
                .replace(/-/g, ' ')       // Transforma hífens em espaços
                .trim();
        }
        
        // Normaliza href para matching
        normalizeHref(href) {
            if (!href) return '';
            
            // Extrai apenas a parte da rota do href
            const match = href.match(/#\/(.+)/);
            if (!match) return '';
            
            return this.normalizeRoute(match[1]);
        }
        
        // Calcula similaridade entre strings
        calculateSimilarity(str1, str2) {
            if (!str1 || !str2) return 0;
            
            // Método simples de similaridade
            const longer = str1.length > str2.length ? str1 : str2;
            const shorter = str1.length > str2.length ? str2 : str1;
            
            if (longer.length === 0) return 1.0;
            
            // Verifica se uma contém a outra
            if (longer.includes(shorter)) {
                return shorter.length / longer.length;
            }
            
            return 0;
        }
        
        // Encontra melhor match
        findBestMatch(currentRoute) {
            const normalizedRoute = this.normalizeRoute(currentRoute);
            const links = Array.from(document.querySelectorAll(CONFIG.sidebarSelectors.links));
            
            let bestMatch = null;
            let bestScore = 0;
            
            links.forEach(link => {
                const href = link.getAttribute('href');
                if (!href || !href.includes('#/')) return;
                
                const normalizedHref = this.normalizeHref(href);
                if (!normalizedHref) return;
                
                // Verifica match exato
                if (normalizedRoute === normalizedHref) {
                    bestMatch = link;
                    bestScore = 1.0;
                    return;
                }
                
                // Verifica se a rota contém o href ou vice-versa
                if (normalizedRoute.includes(normalizedHref) || normalizedHref.includes(normalizedRoute)) {
                    const score = this.calculateSimilarity(normalizedRoute, normalizedHref);
                    if (score > bestScore) {
                        bestScore = score;
                        bestMatch = link;
                    }
                }
                
                // Verifica match por partes
                const routeParts = normalizedRoute.split('/');
                const hrefParts = normalizedHref.split('/');
                
                const commonParts = routeParts.filter(part => 
                    hrefParts.includes(part) && part.length > 2
                );
                
                if (commonParts.length > 0) {
                    const score = commonParts.length / Math.max(routeParts.length, hrefParts.length);
                    if (score > bestScore) {
                        bestScore = score;
                        bestMatch = link;
                    }
                }
            });
            
            // Retorna apenas se score for bom o suficiente
            return bestScore >= 0.3 ? bestMatch : null;
        }
    }
    
    // Gerenciador de estados ativos
    class ActiveStateManager {
        constructor() {
            this.matcher = new RouteMatcher();
        }
        
        // Atualiza estado com base na rota
        update(currentRoute) {
            if (STATE.isProcessing) {
                logger.debug('Atualização já em andamento, ignorando');
                return;
            }
            
            STATE.isProcessing = true;
            
            try {
                // Evita atualizações desnecessárias
                if (STATE.lastRoute === currentRoute) {
                    logger.debug('Rota não mudou, ignorando');
                    return;
                }
                
                logger.debug(`Atualizando estado para rota: ${currentRoute}`);
                
                // Limpa estados anteriores
                this.clear();
                
                // Encontra melhor match
                const matchedLink = this.matcher.findBestMatch(currentRoute);
                
                if (matchedLink) {
                    this.activateElement(matchedLink);
                    logger.debug(`Elemento ativado: ${matchedLink.getAttribute('href')}`);
                } else {
                    logger.warn(`Nenhum match encontrado para rota: ${currentRoute}`);
                }
                
                STATE.lastRoute = currentRoute;
                
            } catch (error) {
                logger.error('Erro ao atualizar estado:', error);
            } finally {
                STATE.isProcessing = false;
            }
        }
        
        // Ativa um elemento e seus pais
        activateElement(element) {
            if (!element) return;
            
            try {
                // 1. Ativa o próprio elemento
                element.classList.add('active');
                STATE.activeElements.add(element);
                
                // 2. Ativa item pai
                const parentItem = element.closest(CONFIG.sidebarSelectors.items);
                if (parentItem) {
                    parentItem.classList.add('active');
                    STATE.activeElements.add(parentItem);
                }
                
                // 3. Se for link de dropdown, ativa o toggle
                if (element.hasAttribute('data-bs-toggle')) {
                    this.activateDropdownToggle(element);
                } else {
                    // 4. Verifica se está dentro de dropdown e o abre
                    this.openParentDropdown(element);
                }
                
                // 5. Rola até o elemento se necessário
                this.scrollToElement(element);
                
            } catch (error) {
                logger.warn('Erro ao ativar elemento:', error);
            }
        }
        
        // Ativa toggle de dropdown
        activateDropdownToggle(element) {
            try {
                if (typeof bootstrap === 'undefined') return;
                
                const targetSelector = element.getAttribute('data-bs-target');
                if (!targetSelector) return;
                
                const dropdown = document.querySelector(targetSelector);
                if (!dropdown) return;
                
                // Abre dropdown se não estiver aberto
                if (!dropdown.classList.contains('show')) {
                    const collapse = bootstrap.Collapse.getInstance(dropdown) || 
                                   new bootstrap.Collapse(dropdown, { toggle: false });
                    collapse.show();
                }
                
                // Marca como ativo
                element.classList.add('active');
                STATE.activeElements.add(element);
                
            } catch (error) {
                logger.warn('Erro ao ativar dropdown:', error);
            }
        }
        
        // Abre dropdown pai
        openParentDropdown(element) {
            try {
                const dropdown = element.closest(CONFIG.sidebarSelectors.dropdowns);
                if (!dropdown) return;
                
                if (typeof bootstrap !== 'undefined') {
                    if (!dropdown.classList.contains('show')) {
                        const collapse = bootstrap.Collapse.getInstance(dropdown) || 
                                       new bootstrap.Collapse(dropdown, { toggle: false });
                        collapse.show();
                    }
                } else {
                    // Fallback se Bootstrap não estiver disponível
                    dropdown.classList.add('show');
                }
                
                // Ativa o botão toggle
                const dropdownId = dropdown.id;
                if (dropdownId) {
                    const toggleButton = document.querySelector(`[data-bs-target="#${dropdownId}"]`);
                    if (toggleButton) {
                        toggleButton.classList.add('active');
                        STATE.activeElements.add(toggleButton);
                        
                        const parentItem = toggleButton.closest(CONFIG.sidebarSelectors.items);
                        if (parentItem) {
                            parentItem.classList.add('active');
                            STATE.activeElements.add(parentItem);
                        }
                    }
                }
                
            } catch (error) {
                logger.warn('Erro ao abrir dropdown pai:', error);
            }
        }
        
        // Rola suavemente até o elemento
        scrollToElement(element) {
            try {
                const sidebar = document.querySelector('.sidebar, .sidebar-content');
                if (!sidebar) return;
                
                // Calcula posição
                const elementRect = element.getBoundingClientRect();
                const sidebarRect = sidebar.getBoundingClientRect();
                
                // Se elemento estiver fora da viewport
                if (elementRect.bottom > sidebarRect.bottom || elementRect.top < sidebarRect.top) {
                    element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                        inline: 'nearest'
                    });
                }
                
            } catch (error) {
                logger.debug('Erro ao rolar para elemento:', error);
            }
        }
        
        // Limpa todos os estados ativos
        clear() {
            STATE.activeElements.forEach(element => {
                try {
                    element.classList.remove('active');
                } catch (error) {
                    // Ignora erros em elementos que podem ter sido removidos
                }
            });
            
            STATE.activeElements.clear();
            clearActiveStates(); // Limpeza adicional
        }
    }
    
    // Gerenciador principal
    class SidebarManager {
        constructor() {
            this.stateManager = new ActiveStateManager();
            this.initialized = false;
        }
        
        // Inicialização com retry
        async init() {
            if (this.initialized) return;
            
            logger.log('Inicializando Sidebar Manager...');
            
            let success = false;
            
            for (let attempt = 1; attempt <= CONFIG.maxRetries; attempt++) {
                try {
                    logger.debug(`Tentativa ${attempt} de ${CONFIG.maxRetries}`);
                    
                    // Verifica se DOM está pronto
                    if (document.readyState !== 'complete') {
                        logger.debug('Documento não está pronto, aguardando...');
                        await this.waitForDOM();
                    }
                    
                    // Verifica requisitos
                    if (!checkDOMRequirements()) {
                        throw new Error('Requisitos DOM não atendidos');
                    }
                    
                    // Atualiza estado inicial
                    const currentRoute = getCurrentRoute();
                    this.stateManager.update(currentRoute);
                    
                    // Configura listeners
                    this.setupListeners();
                    
                    success = true;
                    this.initialized = true;
                    STATE.isInitialized = true;
                    
                    logger.log('✅ Sidebar Manager inicializado com sucesso');
                    break;
                    
                } catch (error) {
                    logger.warn(`Tentativa ${attempt} falhou:`, error.message);
                    
                    if (attempt < CONFIG.maxRetries) {
                        await this.delay(CONFIG.retryDelay * attempt);
                    }
                }
            }
            
            if (!success) {
                logger.error('❌ Falha ao inicializar Sidebar Manager após todas as tentativas');
            }
        }
        
        // Aguarda DOM estar pronto
        waitForDOM() {
            return new Promise(resolve => {
                if (document.readyState === 'complete') {
                    resolve();
                } else {
                    document.addEventListener('DOMContentLoaded', resolve, { once: true });
                }
            });
        }
        
        // Delay helper
        delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        
        // Configura listeners
        setupListeners() {
            try {
                // 1. Hash change (navegação principal)
                window.addEventListener('hashchange', this.handleHashChange.bind(this), { passive: true });
                
                // 2. Clique em links do sidebar
                this.setupClickListeners();
                
                // 3. Evento personalizado do router (se existir)
                this.setupCustomEvents();
                
                // 4. Observador de mutação para conteúdo dinâmico
                this.setupMutationObserver();
                
                logger.debug('Listeners configurados');
                
            } catch (error) {
                logger.error('Erro ao configurar listeners:', error);
            }
        }
        
        // Handler para mudança de hash
        handleHashChange() {
            // Debounce para evitar múltiplas execuções
            if (this.hashChangeTimeout) {
                clearTimeout(this.hashChangeTimeout);
            }
            
            this.hashChangeTimeout = setTimeout(() => {
                const currentRoute = getCurrentRoute();
                this.stateManager.update(currentRoute);
            }, 50);
        }
        
        // Configura listeners de clique
        setupClickListeners() {
            const links = document.querySelectorAll(CONFIG.sidebarSelectors.links);
            
            links.forEach(link => {
                // Remove listener anterior se existir
                link.removeEventListener('click', this.handleLinkClick);
                
                // Adiciona novo listener
                link.addEventListener('click', this.handleLinkClick.bind(this), { passive: true });
            });
            
            logger.debug(`${links.length} listeners de clique configurados`);
        }
        
        // Handler para clique em links
        handleLinkClick(event) {
            // Pequeno delay para permitir que o router processe
            setTimeout(() => {
                const currentRoute = getCurrentRoute();
                this.stateManager.update(currentRoute);
            }, 30);
            
            // Opcional: adiciona feedback visual imediato
            const link = event.currentTarget;
            link.classList.add('clicked');
            setTimeout(() => link.classList.remove('clicked'), 300);
        }
        
        // Configura eventos customizados
        setupCustomEvents() {
            // Evento do router
            window.addEventListener('page:loaded', () => {
                setTimeout(() => {
                    const currentRoute = getCurrentRoute();
                    this.stateManager.update(currentRoute);
                }, 100);
            }, { passive: true });
            
            // Evento para forçar atualização
            window.addEventListener('sidebar:update', () => {
                this.stateManager.update(getCurrentRoute());
            }, { passive: true });
        }
        
        // Configura observador de mutação
        setupMutationObserver() {
            if (!('MutationObserver' in window)) return;
            
            this.mutationObserver = new MutationObserver(mutations => {
                mutations.forEach(mutation => {
                    if (mutation.type === 'childList') {
                        // Verifica se novos links foram adicionados
                        mutation.addedNodes.forEach(node => {
                            if (node.nodeType === 1) { // Element node
                                const newLinks = node.querySelectorAll?.(CONFIG.sidebarSelectors.links);
                                if (newLinks && newLinks.length > 0) {
                                    this.setupClickListeners();
                                }
                            }
                        });
                    }
                });
            });
            
            // Observa o sidebar
            const sidebar = document.querySelector('.sidebar, .sidebar-content, nav');
            if (sidebar) {
                this.mutationObserver.observe(sidebar, {
                    childList: true,
                    subtree: true
                });
            }
        }
        
        // Atualização manual
        update() {
            if (!this.initialized) {
                logger.warn('Manager não inicializado, tentando inicializar...');
                this.init();
                return;
            }
            
            const currentRoute = getCurrentRoute();
            this.stateManager.update(currentRoute);
        }
        
        // Destruição
        destroy() {
            if (this.mutationObserver) {
                this.mutationObserver.disconnect();
            }
            
            if (this.hashChangeTimeout) {
                clearTimeout(this.hashChangeTimeout);
            }
            
            // Remove listeners
            window.removeEventListener('hashchange', this.handleHashChange);
            
            const links = document.querySelectorAll(CONFIG.sidebarSelectors.links);
            links.forEach(link => {
                link.removeEventListener('click', this.handleLinkClick);
            });
            
            this.stateManager.clear();
            this.initialized = false;
            STATE.isInitialized = false;
            
            logger.log('Sidebar Manager destruído');
        }
    }
    
    // Instância global
    let sidebarManager = null;
    
    // Inicialização controlada
    function initialize() {
        try {
            if (!sidebarManager) {
                sidebarManager = new SidebarManager();
            }
            
            // Inicializa com pequeno delay para garantir que tudo está carregado
            setTimeout(() => {
                sidebarManager.init();
            }, 100);
            
        } catch (error) {
            logger.error('Erro crítico na inicialização:', error);
        }
    }
    
    // API pública
    window.SidebarManager = {
        init: function() {
            if (!sidebarManager) {
                sidebarManager = new SidebarManager();
            }
            return sidebarManager.init();
        },
        update: function() {
            if (!sidebarManager) {
                logger.warn('SidebarManager não inicializado');
                return;
            }
            sidebarManager.update();
        },
        destroy: function() {
            if (sidebarManager) {
                sidebarManager.destroy();
                sidebarManager = null;
            }
        },
        getState: function() {
            return {
                isInitialized: STATE.isInitialized,
                lastRoute: STATE.lastRoute,
                activeElements: STATE.activeElements.size
            };
        }
    };
    
    // Auto-inicialização
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
    
})();

// Estilos auxiliares
(function() {
    const styles = `
        .sidebar-link.active {
            position: relative;
        }
        
        .sidebar-link.active::after {
            content: '';
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background-color: currentColor;
            opacity: 0.7;
        }
        
        .sidebar-item.active > .sidebar-link {
            font-weight: 600;
        }
        
        .sidebar-link.clicked {
            transform: scale(0.98);
            transition: transform 0.1s ease;
        }
        
        /* Transições suaves para dropdowns */
        .sidebar-dropdown.collapse {
            transition: height 0.3s ease;
        }
        
        /* Feedback visual para mobile */
        @media (max-width: 768px) {
            .sidebar-link.active {
                background-color: rgba(0, 0, 0, 0.05);
            }
            
            .dark-mode .sidebar-link.active {
                background-color: rgba(255, 255, 255, 0.05);
            }
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
})();