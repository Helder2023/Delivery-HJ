// ====================================================
// 🔗 PREVIEW DE LINKS - VERSÃO PRODUÇÃO SEGURA
// ====================================================

(function() {
    'use strict';
    
    // CONFIGURAÇÕES PARA PRODUÇÃO
    const CONFIG = {
        // ⚠️ NÃO USE PROXIES PÚBLICOS EM PRODUÇÃO
        // Use seu próprio backend ou serviço pago
        apiEndpoint: '/api/link-preview', // SEU ENDPOINT BACKEND
        fallbackMode: true, // Modo fallback quando API falha
        debounceTime: 1000,
        minUrlLength: 10,
        timeout: 5000, // 5 segundos máximo
        maxCacheAge: 24 * 60 * 60 * 1000, // 24 horas
        maxCacheItems: 50,
        useServiceWorker: 'serviceWorker' in navigator,
        offlineSupport: true
    };
    
    // Estado da aplicação
    const STATE = {
        isOnline: navigator.onLine,
        isInitialized: false,
        activeRequests: new Set(),
        cache: new Map()
    };
    
    // Sistema de logging para produção
    const logger = {
        log: (msg, data) => console.log(`[LinkPreview] ${msg}`, data || ''),
        warn: (msg, data) => console.warn(`[LinkPreview] ⚠️ ${msg}`, data || ''),
        error: (msg, data) => console.error(`[LinkPreview] 🔴 ${msg}`, data || ''),
        debug: (msg, data) => {
            if (window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1') {
                console.debug(`[LinkPreview] ${msg}`, data || '');
            }
        }
    };
    
    // ====================================================
    // 1. SISTEMA DE CACHE SEGURO
    // ====================================================
    class SafeCache {
        constructor() {
            this.init();
        }
        
        init() {
            // Verifica se localStorage está disponível
            this.storageAvailable = this.checkLocalStorage();
            
            if (this.storageAvailable) {
                this.cleanupOldCache();
            }
        }
        
        checkLocalStorage() {
            try {
                const testKey = 'linkpreview_test';
                localStorage.setItem(testKey, 'test');
                localStorage.removeItem(testKey);
                return true;
            } catch (error) {
                logger.warn('localStorage não disponível:', error.message);
                return false;
            }
        }
        
        generateKey(url) {
            // URL segura para usar como chave
            try {
                // Usa hash em vez de btoa para suportar Unicode
                return 'lp_' + this.hashString(url.toLowerCase());
            } catch (error) {
                // Fallback simples
                return 'lp_' + encodeURIComponent(url).substring(0, 100);
            }
        }
        
        hashString(str) {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Converte para 32-bit
            }
            return Math.abs(hash).toString(36);
        }
        
        get(url) {
            const key = this.generateKey(url);
            
            // 1. Cache em memória
            if (STATE.cache.has(key)) {
                const cached = STATE.cache.get(key);
                if (Date.now() - cached.timestamp < CONFIG.maxCacheAge) {
                    logger.debug('Cache memória hit:', url);
                    return cached.data;
                }
                STATE.cache.delete(key);
            }
            
            // 2. Cache em localStorage
            if (this.storageAvailable) {
                try {
                    const item = localStorage.getItem(key);
                    if (item) {
                        const cached = JSON.parse(item);
                        if (Date.now() - cached.timestamp < CONFIG.maxCacheAge) {
                            logger.debug('Cache localStorage hit:', url);
                            // Atualiza cache em memória
                            STATE.cache.set(key, cached);
                            return cached.data;
                        } else {
                            // Remove item expirado
                            localStorage.removeItem(key);
                        }
                    }
                } catch (error) {
                    logger.warn('Erro ao ler cache:', error.message);
                }
            }
            
            return null;
        }
        
        set(url, data) {
            const key = this.generateKey(url);
            const cacheItem = {
                data: data,
                timestamp: Date.now(),
                url: url
            };
            
            // 1. Cache em memória
            STATE.cache.set(key, cacheItem);
            
            // 2. Cache em localStorage (com limite)
            if (this.storageAvailable) {
                try {
                    localStorage.setItem(key, JSON.stringify(cacheItem));
                    this.enforceCacheLimit();
                } catch (error) {
                    logger.warn('Erro ao salvar cache:', error.message);
                    this.handleStorageFull();
                }
            }
        }
        
        enforceCacheLimit() {
            try {
                const keys = Object.keys(localStorage).filter(k => k.startsWith('lp_'));
                
                if (keys.length > CONFIG.maxCacheItems) {
                    // Ordena por timestamp (mais antigo primeiro)
                    const items = keys.map(key => ({
                        key,
                        timestamp: JSON.parse(localStorage.getItem(key)).timestamp
                    })).sort((a, b) => a.timestamp - b.timestamp);
                    
                    // Remove os mais antigos
                    const toRemove = items.slice(0, items.length - CONFIG.maxCacheItems);
                    toRemove.forEach(item => {
                        localStorage.removeItem(item.key);
                        STATE.cache.delete(item.key);
                    });
                    
                    logger.debug(`Cache limpo: ${toRemove.length} itens removidos`);
                }
            } catch (error) {
                logger.warn('Erro ao limitar cache:', error);
            }
        }
        
        handleStorageFull() {
            try {
                // Tenta limpar 20% dos itens mais antigos
                const keys = Object.keys(localStorage).filter(k => k.startsWith('lp_'));
                const items = keys.map(key => ({
                    key,
                    timestamp: JSON.parse(localStorage.getItem(key)).timestamp
                })).sort((a, b) => a.timestamp - b.timestamp);
                
                const toRemove = Math.ceil(items.length * 0.2);
                items.slice(0, toRemove).forEach(item => {
                    localStorage.removeItem(item.key);
                });
                
                logger.warn(`Storage limpo: ${toRemove} itens removidos por falta de espaço`);
            } catch (error) {
                logger.error('Falha crítica no storage:', error);
            }
        }
        
        cleanupOldCache() {
            try {
                const keys = Object.keys(localStorage).filter(k => k.startsWith('lp_'));
                const now = Date.now();
                
                keys.forEach(key => {
                    try {
                        const item = JSON.parse(localStorage.getItem(key));
                        if (now - item.timestamp > CONFIG.maxCacheAge * 2) { // Itens muito antigos
                            localStorage.removeItem(key);
                        }
                    } catch (e) {
                        localStorage.removeItem(key);
                    }
                });
            } catch (error) {
                logger.warn('Erro ao limpar cache antigo:', error);
            }
        }
        
        clear() {
            STATE.cache.clear();
            
            if (this.storageAvailable) {
                try {
                    const keys = Object.keys(localStorage).filter(k => k.startsWith('lp_'));
                    keys.forEach(key => localStorage.removeItem(key));
                } catch (error) {
                    logger.warn('Erro ao limpar cache:', error);
                }
            }
        }
    }
    
    // ====================================================
    // 2. VALIDAÇÃO E SANITIZAÇÃO
    // ====================================================
    class ValidationService {
        static isValidUrl(url) {
            if (!url || typeof url !== 'string') return false;
            if (url.length < CONFIG.minUrlLength) return false;
            
            // Verificação rápida
            const urlPattern = /^(https?:\/\/)?([\w\-]+\.)+[\w\-]{2,}(\/\S*)?$/i;
            if (!urlPattern.test(url)) return false;
            
            // Verificação completa
            try {
                const urlObj = new URL(url);
                return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
            } catch {
                return false;
            }
        }
        
        static sanitizeHtml(html) {
            if (typeof html !== 'string') return '';
            
            // Remove tags script, style, iframe, etc
            return html
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
                .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
                .replace(/on\w+="[^"]*"/gi, '')
                .replace(/on\w+='[^']*'/gi, '')
                .replace(/javascript:/gi, '')
                .substring(0, 100000); // Limite de tamanho
        }
        
        static sanitizeText(text) {
            if (!text) return '';
            
            return String(text)
                .replace(/[<>]/g, '') // Remove < e >
                .replace(/&/g, '&amp;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#x27;')
                .substring(0, 200); // Limite de caracteres
        }
        
        static sanitizeUrl(url) {
            try {
                const urlObj = new URL(url);
                
                // Remove credenciais da URL
                urlObj.username = '';
                urlObj.password = '';
                
                return urlObj.toString();
            } catch {
                return '';
            }
        }
        
        static getDomainFromUrl(url) {
            try {
                const domain = new URL(url).hostname.replace('www.', '');
                return domain.substring(0, 50);
            } catch {
                return 'link';
            }
        }
        
        static isImageUrl(url) {
            if (!url) return false;
            return /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i.test(url);
        }
        
        static isVideoUrl(url) {
            if (!url) return false;
            return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url) ||
                   url.includes('youtube.com') ||
                   url.includes('youtu.be') ||
                   url.includes('vimeo.com');
        }
    }
    
    // ====================================================
    // 3. API SERVICE (COMUNICAÇÃO COM BACKEND)
    // ====================================================
    class ApiService {
        constructor() {
            this.cache = new SafeCache();
        }
        
        async fetchPreview(url) {
            const sanitizedUrl = ValidationService.sanitizeUrl(url);
            
            if (!sanitizedUrl) {
                throw new Error('URL inválida');
            }
            
            // Verifica cache primeiro
            const cached = this.cache.get(sanitizedUrl);
            if (cached) {
                logger.debug('Retornando do cache:', sanitizedUrl);
                return cached;
            }
            
            // Verifica se é imagem/vídeo direto
            if (ValidationService.isImageUrl(sanitizedUrl)) {
                return this.getImageMetadata(sanitizedUrl);
            }
            
            if (ValidationService.isVideoUrl(sanitizedUrl)) {
                return this.getVideoMetadata(sanitizedUrl);
            }
            
            // Tenta API backend
            try {
                const metadata = await this.fetchFromBackend(sanitizedUrl);
                this.cache.set(sanitizedUrl, metadata);
                return metadata;
            } catch (error) {
                logger.warn('API falhou, usando fallback:', error.message);
                return this.getFallbackMetadata(sanitizedUrl);
            }
        }
        
        async fetchFromBackend(url) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), CONFIG.timeout);
            
            try {
                const response = await fetch(CONFIG.apiEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ url }),
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                
                const data = await response.json();
                
                if (!data.success) {
                    throw new Error(data.message || 'API error');
                }
                
                return {
                    title: ValidationService.sanitizeText(data.title),
                    description: ValidationService.sanitizeText(data.description),
                    image: ValidationService.sanitizeUrl(data.image),
                    url: ValidationService.sanitizeUrl(url),
                    domain: ValidationService.getDomainFromUrl(url),
                    type: data.type || 'website'
                };
                
            } catch (error) {
                clearTimeout(timeoutId);
                throw error;
            }
        }
        
        getImageMetadata(url) {
            return {
                title: 'Imagem',
                description: '',
                image: ValidationService.sanitizeUrl(url),
                url: ValidationService.sanitizeUrl(url),
                domain: ValidationService.getDomainFromUrl(url),
                type: 'image'
            };
        }
        
        getVideoMetadata(url) {
            let thumbnail = '';
            
            // YouTube
            const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
            if (ytMatch && ytMatch[1]) {
                thumbnail = `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
            }
            // Vimeo
            else if (url.includes('vimeo.com')) {
                const vimeoMatch = url.match(/vimeo\.com\/(\d+)/i);
                if (vimeoMatch && vimeoMatch[1]) {
                    thumbnail = `https://vumbnail.com/${vimeoMatch[1]}.jpg`;
                }
            }
            
            return {
                title: 'Vídeo',
                description: '',
                image: thumbnail,
                url: ValidationService.sanitizeUrl(url),
                domain: ValidationService.getDomainFromUrl(url),
                type: 'video'
            };
        }
        
        getFallbackMetadata(url) {
            const domain = ValidationService.getDomainFromUrl(url);
            
            return {
                title: domain,
                description: 'Clique para visitar',
                image: `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
                url: ValidationService.sanitizeUrl(url),
                domain: domain,
                type: 'website'
            };
        }
    }
    
    // ====================================================
    // 4. RENDERIZAÇÃO SEGURA
    // ====================================================
    class RenderService {
        static createPreviewElement(metadata) {
            const container = document.createElement('div');
            container.className = 'link-preview-container';
            container.style.cssText = `
                position: relative;
                border-radius: 6px;
                overflow: hidden;
                background: var(--preview-bg, #f8f9fa);
                border: 1px solid var(--preview-border, #e9ecef);
                margin-bottom: 12px;
                transition: transform 0.2s ease;
            `;
            
            container.innerHTML = this.generateSafeHtml(metadata);
            
            // Evento de clique abre a URL
            container.addEventListener('click', (e) => {
                if (e.target.tagName !== 'A') {
                    window.open(metadata.url, '_blank', 'noopener noreferrer');
                }
            });
            
            return container;
        }
        
        static generateSafeHtml(metadata) {
            const title = ValidationService.sanitizeText(metadata.title);
            const domain = ValidationService.sanitizeText(metadata.domain);
            
            if (metadata.image) {
                return `
                    <div style="position: relative; height: 160px; overflow: hidden;">
                        <img 
                            src="${ValidationService.sanitizeUrl(metadata.image)}" 
                            alt="${title}"
                            style="width: 100%; height: 100%; object-fit: cover;"
                            loading="lazy"
                            onerror="this.onerror=null; this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 300 160%22><rect width=%22300%22 height=%22160%22 fill=%22%23f8f9fa%22/><text x=%22150%22 y=%2280%22 font-family=%22Arial%22 font-size=%2214%22 text-anchor=%22middle%22 fill=%22%23666%22>${domain}</text></svg>';"
                        >
                        <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.7)); color: white; padding: 8px 12px;">
                            <div style="font-size: 12px; font-weight: 600; margin-bottom: 2px;">${title}</div>
                            <div style="font-size: 10px; opacity: 0.8;">${domain}</div>
                        </div>
                    </div>
                `;
            } else {
                return `
                    <div style="padding: 16px; min-height: 120px; display: flex; flex-direction: column; justify-content: center;">
                        <div style="display: flex; align-items: center; margin-bottom: 8px;">
                            <div style="width: 24px; height: 24px; border-radius: 4px; background: var(--primary, #4a6cf7); color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-right: 8px;">
                                ${domain.charAt(0).toUpperCase()}
                            </div>
                            <span style="font-size: 12px; color: var(--text-muted, #666);">${domain}</span>
                        </div>
                        <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px; color: var(--text-color, #333);">${title}</div>
                        ${metadata.description ? `<div style="font-size: 12px; color: var(--text-muted, #666); line-height: 1.4;">${metadata.description}</div>` : ''}
                    </div>
                `;
            }
        }
        
        static createLoadingElement() {
            const div = document.createElement('div');
            div.className = 'link-preview-loading';
            div.style.cssText = `
                height: 160px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: var(--preview-bg, #f8f9fa);
                border-radius: 6px;
                border: 1px dashed var(--preview-border, #e9ecef);
            `;
            
            div.innerHTML = `
                <div style="text-align: center;">
                    <div class="spinner-border spinner-border-sm text-primary" role="status" style="width: 1rem; height: 1rem;">
                        <span class="visually-hidden">Carregando...</span>
                    </div>
                    <div style="font-size: 12px; color: var(--text-muted, #666); margin-top: 8px;">Gerando preview...</div>
                </div>
            `;
            
            return div;
        }
        
        static createErrorElement(message) {
            const div = document.createElement('div');
            div.className = 'link-preview-error';
            div.style.cssText = `
                padding: 12px;
                background: var(--danger-light, #f8d7da);
                border: 1px solid var(--danger-border, #f5c6cb);
                border-radius: 6px;
                color: var(--danger, #721c24);
                font-size: 12px;
                text-align: center;
            `;
            
            div.innerHTML = `
                <i class="fas fa-exclamation-triangle me-1"></i>
                ${ValidationService.sanitizeText(message)}
            `;
            
            return div;
        }
    }
    
    // ====================================================
    // 5. GERENCIADOR PRINCIPAL
    // ====================================================
    class LinkPreviewManager {
        constructor() {
            this.api = new ApiService();
            this.activeProcesses = new Map();
            this.debounceTimers = new Map();
            
            this.init();
        }
        
        init() {
            logger.log('Inicializando Link Preview Manager');
            
            // Monitora conectividade
            window.addEventListener('online', () => {
                STATE.isOnline = true;
                logger.log('Online - retomando operações');
            });
            
            window.addEventListener('offline', () => {
                STATE.isOnline = false;
                logger.warn('Offline - usando cache apenas');
            });
            
            // Configura observador para novos cards
            this.setupObserver();
            
            // Processa cards existentes
            this.processExistingCards();
            
            STATE.isInitialized = true;
        }
        
        setupObserver() {
            if (!('MutationObserver' in window)) return;
            
            const observer = new MutationObserver((mutations) => {
                for (const mutation of mutations) {
                    if (mutation.type === 'childList') {
                        for (const node of mutation.addedNodes) {
                            if (node.nodeType === 1) { // Element node
                                const cards = node.querySelectorAll?.('.anuncio-card') || [];
                                cards.forEach(card => this.setupCard(card));
                                
                                // Se o próprio node for um card
                                if (node.matches?.('.anuncio-card')) {
                                    this.setupCard(node);
                                }
                            }
                        }
                    }
                }
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
        
        processExistingCards() {
            const cards = document.querySelectorAll('.anuncio-card');
            logger.debug(`Encontrados ${cards.length} cards existentes`);
            
            cards.forEach((card, index) => {
                // Delay escalonado para não sobrecarregar
                setTimeout(() => this.setupCard(card), index * 300);
            });
        }
        
        setupCard(card) {
            // Verifica se já foi processado
            if (card.dataset.previewInitialized === 'true') return;
            
            const input = card.querySelector('.link-input');
            const previewContainer = card.querySelector('.preview-container');
            
            if (!input || !previewContainer) {
                logger.debug('Card sem input ou container');
                return;
            }
            
            // Marca como inicializado
            card.dataset.previewInitialized = 'true';
            
            // Configura eventos
            this.setupInputEvents(input, previewContainer);
            
            // Processa URL existente
            if (input.value && ValidationService.isValidUrl(input.value)) {
                setTimeout(() => {
                    this.processLink(input.value, previewContainer);
                }, 500);
            }
        }
        
        setupInputEvents(input, container) {
            let debounceTimer;
            
            const process = () => {
                const url = input.value.trim();
                
                // Limpa processamentos anteriores
                if (this.activeProcesses.has(container)) {
                    // Opcional: cancelar fetch se possível
                    this.activeProcesses.delete(container);
                }
                
                // Limpa container se URL vazia
                if (!url) {
                    container.innerHTML = '';
                    return;
                }
                
                // Valida URL
                if (!ValidationService.isValidUrl(url)) {
                    if (url.length > 5) {
                        container.innerHTML = '';
                        container.appendChild(RenderService.createErrorElement(
                            'URL inválida. Use https://exemplo.com'
                        ));
                    }
                    return;
                }
                
                // Mostra loading
                container.innerHTML = '';
                container.appendChild(RenderService.createLoadingElement());
                
                // Processa a URL
                this.processLink(url, container);
            };
            
            // Debounce otimizado
            input.addEventListener('input', () => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(process, CONFIG.debounceTime);
            });
            
            // Processa também em blur (quando o usuário sai do campo)
            input.addEventListener('blur', process);
        }
        
        async processLink(url, container) {
            const requestId = Date.now() + Math.random();
            this.activeProcesses.set(container, requestId);
            
            try {
                // Verifica conectividade
                if (!STATE.isOnline && CONFIG.offlineSupport) {
                    const cached = this.api.cache.get(url);
                    if (cached) {
                        this.renderPreview(cached, container);
                        return;
                    }
                    throw new Error('Sem conexão e cache não disponível');
                }
                
                // Busca preview
                const metadata = await this.api.fetchPreview(url);
                
                // Verifica se ainda é a request atual
                if (this.activeProcesses.get(container) === requestId) {
                    this.renderPreview(metadata, container);
                }
                
            } catch (error) {
                // Verifica se ainda é a request atual
                if (this.activeProcesses.get(container) === requestId) {
                    logger.warn('Erro ao processar link:', error.message);
                    
                    container.innerHTML = '';
                    container.appendChild(RenderService.createErrorElement(
                        STATE.isOnline ? 'Erro ao carregar preview' : 'Sem conexão'
                    ));
                }
            } finally {
                // Limpa a referência
                if (this.activeProcesses.get(container) === requestId) {
                    this.activeProcesses.delete(container);
                }
            }
        }
        
        renderPreview(metadata, container) {
            container.innerHTML = '';
            container.appendChild(RenderService.createPreviewElement(metadata));
            
            // Animação de entrada
            requestAnimationFrame(() => {
                container.style.opacity = '0';
                container.style.transform = 'translateY(10px)';
                
                requestAnimationFrame(() => {
                    container.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                    container.style.opacity = '1';
                    container.style.transform = 'translateY(0)';
                });
            });
        }
    }
    
    // ====================================================
    // 6. INICIALIZAÇÃO
    // ====================================================
    function initialize() {
        // Verifica dependências
        if (!('fetch' in window)) {
            logger.error('Fetch API não suportada');
            return;
        }
        
        if (!('URL' in window)) {
            logger.error('URL API não suportada');
            return;
        }
        
        // Inicializa o manager
        setTimeout(() => {
            try {
                window.linkPreviewManager = new LinkPreviewManager();
                logger.log('✅ Link Preview inicializado com sucesso');
            } catch (error) {
                logger.error('❌ Falha ao inicializar Link Preview:', error);
            }
        }, 100);
    }
    
    // Inicializa quando seguro
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        // DOM já carregado, inicializa com delay
        setTimeout(initialize, 0);
    }
    
    // API pública
    window.LinkPreview = {
        processUrl: async (url) => {
            const api = new ApiService();
            return await api.fetchPreview(url);
        },
        clearCache: () => {
            const cache = new SafeCache();
            cache.clear();
        },
        isOnline: () => STATE.isOnline,
        destroy: () => {
            if (window.linkPreviewManager) {
                window.linkPreviewManager.activeProcesses.clear();
            }
        }
    };
    
})();

// ====================================================
// 7. CSS NECESSÁRIO (adicione ao seu arquivo CSS)
// ====================================================
const linkPreviewStyles = `
    .link-preview-container {
        cursor: pointer;
    }
    
    .link-preview-container:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    
    .link-preview-container img {
        transition: transform 0.3s ease;
    }
    
    .link-preview-container:hover img {
        transform: scale(1.05);
    }
    
    .dark-mode .link-preview-container {
        background: #2d2d2d;
        border-color: #444;
    }
    
    .dark-mode .link-preview-loading {
        background: #2d2d2d;
        border-color: #444;
    }
    
    @media (max-width: 768px) {
        .link-preview-container {
            margin-bottom: 8px;
        }
    }
`;

// Adiciona estilos dinamicamente
(function() {
    const style = document.createElement('style');
    style.textContent = linkPreviewStyles;
    document.head.appendChild(style);
})();