// ====================================================
// 🔗 PREVIEW DE LINKS - VERSÃO PRODUÇÃO REVISADA
// ====================================================

(function() {
    'use strict';
    
    // CONFIGURAÇÕES SEGURAS PARA PRODUÇÃO
    const CONFIG = {
        // Endpoints com fallback
        apiEndpoints: [
            '/api/link-preview',
            '/api/preview/link',
            'https://api.microlink.io?url=' // Serviço externo como último recurso
        ],
        fallbackMode: true,
        debounceTime: 1200,
        minUrlLength: 8,
        timeout: 4000,
        maxCacheAge: 12 * 60 * 60 * 1000, // 12 horas
        maxCacheItems: 30,
        maxConcurrentRequests: 3,
        offlineSupport: true,
        enableCorsProxy: false, // Desativado por padrão por segurança
        debug: false
    };
    
    // Estado gerenciado
    const STATE = {
        isOnline: navigator.onLine,
        isInitialized: false,
        activeRequests: new Map(),
        requestQueue: [],
        concurrentCount: 0
    };
    
    // Logger seguro (não vaza em produção)
    const logger = {
        log: (msg, data) => {
            if (CONFIG.debug && window.location.hostname === 'localhost') {
                console.log(`[LinkPreview] ${msg}`, data || '');
            }
        },
        warn: (msg, data) => console.warn(`[LinkPreview] ⚠️ ${msg}`, data || ''),
        error: (msg, data) => console.error(`[LinkPreview] 🔴 ${msg}`, data || '')
    };
    
    // ====================================================
    // 1. SISTEMA DE CACHE REVISADO
    // ====================================================
    class SecureCache {
        constructor() {
            this.prefix = 'lp_';
            this.init();
        }
        
        init() {
            this.storageAvailable = this.testStorage();
            if (this.storageAvailable) {
                this.cleanup();
            }
        }
        
        testStorage() {
            try {
                const test = '__storage_test__';
                localStorage.setItem(test, test);
                localStorage.removeItem(test);
                return true;
            } catch (e) {
                return false;
            }
        }
        
        createKey(url) {
            try {
                // Hash mais robusto
                let hash = 0;
                const str = url.toLowerCase();
                for (let i = 0; i < str.length; i++) {
                    const char = str.charCodeAt(i);
                    hash = ((hash << 5) - hash) + char;
                    hash = hash & 0xFFFFFFFF; // 32-bit
                }
                return this.prefix + Math.abs(hash).toString(36);
            } catch {
                // Fallback seguro
                return this.prefix + btoa(encodeURIComponent(url)).substring(0, 20).replace(/[^a-zA-Z0-9]/g, '');
            }
        }
        
        get(url) {
            const key = this.createKey(url);
            
            // Memória primeiro
            if (STATE.cache && STATE.cache[key]) {
                const cached = STATE.cache[key];
                if (Date.now() - cached.t < CONFIG.maxCacheAge) {
                    return cached.d;
                }
                delete STATE.cache[key];
            }
            
            // LocalStorage
            if (this.storageAvailable) {
                try {
                    const item = localStorage.getItem(key);
                    if (item) {
                        const cached = JSON.parse(item);
                        if (Date.now() - cached.t < CONFIG.maxCacheAge) {
                            // Atualiza memória
                            if (!STATE.cache) STATE.cache = {};
                            STATE.cache[key] = cached;
                            return cached.d;
                        }
                        localStorage.removeItem(key);
                    }
                } catch (e) {
                    logger.warn('Cache read error', e.message);
                }
            }
            
            return null;
        }
        
        set(url, data) {
            const key = this.createKey(url);
            const cacheItem = {
                d: data,
                t: Date.now(),
                u: url.substring(0, 100)
            };
            
            // Memória
            if (!STATE.cache) STATE.cache = {};
            STATE.cache[key] = cacheItem;
            
            // LocalStorage com limite
            if (this.storageAvailable) {
                try {
                    localStorage.setItem(key, JSON.stringify(cacheItem));
                    this.enforceLimits();
                } catch (e) {
                    if (e.name === 'QuotaExceededError') {
                        this.clearOldest(5);
                    }
                }
            }
        }
        
        enforceLimits() {
            if (!this.storageAvailable) return;
            
            try {
                const keys = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key.startsWith(this.prefix)) {
                        keys.push(key);
                    }
                }
                
                if (keys.length > CONFIG.maxCacheItems) {
                    // Remove os mais antigos
                    const items = keys.map(k => ({
                        k,
                        t: JSON.parse(localStorage.getItem(k)).t
                    })).sort((a, b) => a.t - b.t);
                    
                    const toRemove = items.slice(0, items.length - CONFIG.maxCacheItems);
                    toRemove.forEach(item => {
                        localStorage.removeItem(item.k);
                        if (STATE.cache && STATE.cache[item.k]) {
                            delete STATE.cache[item.k];
                        }
                    });
                }
            } catch (e) {
                logger.warn('Limit enforcement failed', e.message);
            }
        }
        
        clearOldest(count) {
            if (!this.storageAvailable) return;
            
            try {
                const items = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key.startsWith(this.prefix)) {
                        const item = localStorage.getItem(key);
                        if (item) {
                            items.push({
                                k: key,
                                t: JSON.parse(item).t
                            });
                        }
                    }
                }
                
                items.sort((a, b) => a.t - b.t);
                items.slice(0, count).forEach(item => {
                    localStorage.removeItem(item.k);
                });
            } catch (e) {
                // Silencioso
            }
        }
        
        cleanup() {
            if (!this.storageAvailable) return;
            
            try {
                const now = Date.now();
                const toRemove = [];
                
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key.startsWith(this.prefix)) {
                        const item = localStorage.getItem(key);
                        if (item) {
                            const cached = JSON.parse(item);
                            if (now - cached.t > CONFIG.maxCacheAge * 2) {
                                toRemove.push(key);
                            }
                        }
                    }
                }
                
                toRemove.forEach(key => localStorage.removeItem(key));
            } catch (e) {
                logger.warn('Cache cleanup failed', e.message);
            }
        }
        
        clear() {
            if (STATE.cache) {
                STATE.cache = {};
            }
            
            if (this.storageAvailable) {
                try {
                    const toRemove = [];
                    for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        if (key.startsWith(this.prefix)) {
                            toRemove.push(key);
                        }
                    }
                    toRemove.forEach(key => localStorage.removeItem(key));
                } catch (e) {
                    logger.warn('Cache clear failed', e.message);
                }
            }
        }
    }
    
    // ====================================================
    // 2. VALIDAÇÃO E SANITIZAÇÃO MELHORADA
    // ====================================================
    class SecurityService {
        // Verificação de URL robusta
        static isValidUrl(url) {
            if (typeof url !== 'string' || url.length < CONFIG.minUrlLength) {
                return false;
            }
            
            // Remover espaços
            url = url.trim();
            
            // Padrão mais flexível
            const urlPattern = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(:\d+)?(\/[\w~\-\.%]*)*(\?[&\w=~\-\.%]*)?(#[\w\-\.%]*)?$/i;
            if (!urlPattern.test(url)) {
                return false;
            }
            
            // Verificação com URL API
            try {
                const urlObj = new URL(url);
                const protocol = urlObj.protocol;
                const hostname = urlObj.hostname;
                
                // Protocolos permitidos
                if (!['http:', 'https:'].includes(protocol)) {
                    return false;
                }
                
                // Hostname não pode ser IP privado
                if (/^(10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.|127\.|169\.254\.|::1|fc00::|fe80::)/.test(hostname)) {
                    return false;
                }
                
                return true;
            } catch {
                return false;
            }
        }
        
        // Sanitização completa de texto
        static sanitizeText(text, maxLength = 200) {
            if (text == null) return '';
            
            const str = String(text);
            
            // Remove tags HTML
            let sanitized = str.replace(/<[^>]*>/g, '');
            
            // Codifica caracteres especiais
            sanitized = sanitized
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#x27;')
                .replace(/\//g, '&#x2F;');
            
            // Remove caracteres de controle
            sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
            
            // Limita tamanho
            if (sanitized.length > maxLength) {
                sanitized = sanitized.substring(0, maxLength - 3) + '...';
            }
            
            return sanitized;
        }
        
        // Sanitização de URL
        static sanitizeUrl(url) {
            if (!url) return '';
            
            try {
                const urlObj = new URL(url);
                
                // Remove credenciais
                urlObj.username = '';
                urlObj.password = '';
                
                // Força HTTPS se possível
                if (urlObj.protocol === 'http:' && 
                    !urlObj.hostname.includes('localhost') &&
                    !urlObj.hostname.includes('127.0.0.1')) {
                    urlObj.protocol = 'https:';
                }
                
                return urlObj.toString();
            } catch {
                // Fallback: remove caracteres perigosos
                return url.replace(/[\x00-\x1F\x7F"'<>\\^`{|}]/g, '');
            }
        }
        
        // Extrai domínio de forma segura
        static getDomain(url) {
            try {
                const urlObj = new URL(url);
                let domain = urlObj.hostname;
                
                // Remove subdomínio www
                if (domain.startsWith('www.')) {
                    domain = domain.substring(4);
                }
                
                // Limita tamanho
                return domain.substring(0, 30);
            } catch {
                return 'link';
            }
        }
        
        // Verifica tipo de mídia
        static getMediaType(url) {
            if (!url) return 'unknown';
            
            const imageExt = /\.(jpg|jpeg|png|gif|webp|bmp|svg|ico)(\?.*)?$/i;
            const videoExt = /\.(mp4|webm|ogg|mov|avi|wmv|flv)(\?.*)?$/i;
            const audioExt = /\.(mp3|wav|ogg|m4a)(\?.*)?$/i;
            
            if (imageExt.test(url)) return 'image';
            if (videoExt.test(url)) return 'video';
            if (audioExt.test(url)) return 'audio';
            if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
            if (url.includes('vimeo.com')) return 'vimeo';
            
            return 'website';
        }
    }
    
    // ====================================================
    // 3. API SERVICE COM FALLBACKS
    // ====================================================
    class PreviewService {
        constructor() {
            this.cache = new SecureCache();
            this.requestQueue = [];
        }
        
        async getPreview(url) {
            const sanitizedUrl = SecurityService.sanitizeUrl(url);
            
            if (!SecurityService.isValidUrl(sanitizedUrl)) {
                throw new Error('URL inválida ou não segura');
            }
            
            // Cache primeiro
            const cached = this.cache.get(sanitizedUrl);
            if (cached) {
                return cached;
            }
            
            // Tipo de mídia direta
            const mediaType = SecurityService.getMediaType(sanitizedUrl);
            if (mediaType !== 'website') {
                return this.getMediaMetadata(sanitizedUrl, mediaType);
            }
            
            // Tenta endpoints em sequência
            return this.fetchWithFallbacks(sanitizedUrl);
        }
        
        async fetchWithFallbacks(url) {
            let lastError;
            
            for (const endpoint of CONFIG.apiEndpoints) {
                try {
                    const metadata = await this.fetchFromEndpoint(endpoint, url);
                    this.cache.set(url, metadata);
                    return metadata;
                } catch (error) {
                    lastError = error;
                    logger.warn(`Endpoint ${endpoint} falhou:`, error.message);
                    // Continua para próximo endpoint
                }
            }
            
            // Todos falharam, usa fallback
            logger.warn('Todos endpoints falharam, usando fallback');
            return this.getFallbackMetadata(url);
        }
        
        async fetchFromEndpoint(endpoint, url) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), CONFIG.timeout);
            
            try {
                let requestUrl, options;
                
                if (endpoint.startsWith('http')) {
                    // Serviço externo
                    requestUrl = endpoint + encodeURIComponent(url);
                    options = {
                        signal: controller.signal,
                        headers: {
                            'Accept': 'application/json',
                            'User-Agent': 'LinkPreview/1.0'
                        }
                    };
                } else {
                    // Seu backend
                    requestUrl = endpoint;
                    options = {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({ url }),
                        signal: controller.signal,
                        credentials: 'same-origin'
                    };
                }
                
                const response = await fetch(requestUrl, options);
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                
                const data = await response.json();
                
                // Valida resposta
                if (!data || typeof data !== 'object') {
                    throw new Error('Resposta inválida');
                }
                
                return {
                    title: SecurityService.sanitizeText(data.title || ''),
                    description: SecurityService.sanitizeText(data.description || ''),
                    image: SecurityService.sanitizeUrl(data.image || ''),
                    url: SecurityService.sanitizeUrl(url),
                    domain: SecurityService.getDomain(url),
                    type: SecurityService.getMediaType(url)
                };
                
            } catch (error) {
                clearTimeout(timeoutId);
                throw error;
            }
        }
        
        getMediaMetadata(url, type) {
            const metadata = {
                title: type.charAt(0).toUpperCase() + type.slice(1),
                description: '',
                image: '',
                url: SecurityService.sanitizeUrl(url),
                domain: SecurityService.getDomain(url),
                type: type
            };
            
            if (type === 'youtube') {
                const videoId = this.extractYouTubeId(url);
                if (videoId) {
                    metadata.image = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
                    metadata.title = 'Vídeo do YouTube';
                }
            } else if (type === 'vimeo') {
                const videoId = this.extractVimeoId(url);
                if (videoId) {
                    metadata.image = `https://vumbnail.com/${videoId}.jpg`;
                    metadata.title = 'Vídeo do Vimeo';
                }
            } else if (type === 'image') {
                metadata.image = SecurityService.sanitizeUrl(url);
            }
            
            this.cache.set(url, metadata);
            return metadata;
        }
        
        extractYouTubeId(url) {
            const patterns = [
                /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i,
                /youtube\.com\/watch\?v=([^&]+)/i,
                /youtu\.be\/([^?]+)/i
            ];
            
            for (const pattern of patterns) {
                const match = url.match(pattern);
                if (match && match[1]) {
                    return match[1];
                }
            }
            
            return null;
        }
        
        extractVimeoId(url) {
            const match = url.match(/vimeo\.com\/(\d+)/i);
            return match ? match[1] : null;
        }
        
        getFallbackMetadata(url) {
            const domain = SecurityService.getDomain(url);
            
            const metadata = {
                title: domain,
                description: 'Clique para visitar este site',
                image: this.getFaviconUrl(domain),
                url: SecurityService.sanitizeUrl(url),
                domain: domain,
                type: 'website'
            };
            
            this.cache.set(url, metadata);
            return metadata;
        }
        
        getFaviconUrl(domain) {
            // Tenta várias fontes de favicon
            const sources = [
                `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
                `https://favicon.yandex.net/favicon/${domain}`,
                `https://icons.duckduckgo.com/ip3/${domain}.ico`
            ];
            
            return sources[0]; // Retorna primeiro, o onerror tentará outros
        }
    }
    
    // ====================================================
    // 4. RENDERIZAÇÃO SEGURA COM TEMPLATES
    // ====================================================
    class RenderService {
        static createElement(tag, attributes = {}, children = []) {
            const element = document.createElement(tag);
            
            // Atributos seguros
            Object.entries(attributes).forEach(([key, value]) => {
                if (key.startsWith('on')) return; // Remove handlers inline
                element.setAttribute(key, value);
            });
            
            // Adiciona children
            children.forEach(child => {
                if (typeof child === 'string') {
                    element.appendChild(document.createTextNode(child));
                } else if (child instanceof Node) {
                    element.appendChild(child);
                }
            });
            
            return element;
        }
        
        static createPreview(metadata) {
            const container = this.createElement('div', {
                'class': 'link-preview',
                'data-type': metadata.type,
                'data-domain': metadata.domain
            });
            
            // Estilos inline (escapados)
            container.style.cssText = `
                border: 1px solid var(--border-color, #e0e0e0);
                border-radius: 8px;
                overflow: hidden;
                background: var(--bg-color, #ffffff);
                transition: transform 0.2s ease, box-shadow 0.2s ease;
                cursor: pointer;
                position: relative;
            `;
            
            // Conteúdo baseado no tipo
            if (metadata.image && metadata.type !== 'website') {
                container.appendChild(this.createImagePreview(metadata));
            } else {
                container.appendChild(this.createTextPreview(metadata));
            }
            
            // Event listener seguro
            container.addEventListener('click', (e) => {
                if (e.defaultPrevented) return;
                e.preventDefault();
                
                // Abre em nova janela apenas se for clique primário
                if (e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
                    const newWindow = window.open(metadata.url, '_blank', 'noopener,noreferrer');
                    if (!newWindow) {
                        // Popup bloqueado, redireciona na mesma aba
                        window.location.href = metadata.url;
                    }
                }
            }, { passive: false });
            
            return container;
        }
        
        static createImagePreview(metadata) {
            const wrapper = this.createElement('div', {
                'class': 'preview-image-wrapper'
            });
            
            wrapper.style.cssText = `
                position: relative;
                height: 180px;
                overflow: hidden;
            `;
            
            const img = this.createElement('img', {
                'src': metadata.image,
                'alt': SecurityService.sanitizeText(metadata.title),
                'loading': 'lazy',
                'class': 'preview-image'
            });
            
            img.style.cssText = `
                width: 100%;
                height: 100%;
                object-fit: cover;
            `;
            
            // Fallback para imagem quebrada
            img.onerror = () => {
                img.style.display = 'none';
                wrapper.appendChild(this.createFallbackContent(metadata));
            };
            
            const overlay = this.createElement('div', {
                'class': 'preview-overlay'
            });
            
            overlay.style.cssText = `
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                background: linear-gradient(transparent, rgba(0,0,0,0.7));
                color: white;
                padding: 12px;
            `;
            
            const title = this.createElement('div', {
                'class': 'preview-title'
            }, [metadata.title]);
            
            title.style.cssText = `
                font-size: 14px;
                font-weight: 600;
                margin-bottom: 4px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            `;
            
            const domain = this.createElement('div', {
                'class': 'preview-domain'
            }, [metadata.domain]);
            
            domain.style.cssText = `
                font-size: 12px;
                opacity: 0.9;
            `;
            
            overlay.appendChild(title);
            overlay.appendChild(domain);
            
            wrapper.appendChild(img);
            wrapper.appendChild(overlay);
            
            return wrapper;
        }
        
        static createTextPreview(metadata) {
            const content = this.createElement('div', {
                'class': 'preview-text-content'
            });
            
            content.style.cssText = `
                padding: 16px;
                display: flex;
                flex-direction: column;
                gap: 8px;
            `;
            
            const header = this.createElement('div', {
                'class': 'preview-header'
            });
            
            header.style.cssText = `
                display: flex;
                align-items: center;
                gap: 8px;
            `;
            
            const favicon = this.createElement('img', {
                'src': metadata.image || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="%23666"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>',
                'alt': '',
                'class': 'preview-favicon'
            });
            
            favicon.style.cssText = `
                width: 16px;
                height: 16px;
                border-radius: 2px;
            `;
            
            favicon.onerror = () => {
                favicon.style.display = 'none';
            };
            
            const domainText = this.createElement('span', {
                'class': 'preview-domain'
            }, [metadata.domain]);
            
            domainText.style.cssText = `
                font-size: 12px;
                color: var(--text-muted, #666);
            `;
            
            header.appendChild(favicon);
            header.appendChild(domainText);
            
            const title = this.createElement('div', {
                'class': 'preview-title'
            }, [metadata.title]);
            
            title.style.cssText = `
                font-size: 14px;
                font-weight: 600;
                color: var(--text-color, #333);
                line-height: 1.3;
            `;
            
            if (metadata.description) {
                const desc = this.createElement('div', {
                    'class': 'preview-description'
                }, [metadata.description]);
                
                desc.style.cssText = `
                    font-size: 12px;
                    color: var(--text-muted, #666);
                    line-height: 1.4;
                `;
                
                content.appendChild(header);
                content.appendChild(title);
                content.appendChild(desc);
            } else {
                content.appendChild(header);
                content.appendChild(title);
            }
            
            return content;
        }
        
        static createFallbackContent(metadata) {
            const fallback = this.createElement('div', {
                'class': 'preview-fallback'
            });
            
            fallback.style.cssText = `
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background: var(--bg-secondary, #f5f5f5);
                color: var(--text-muted, #666);
                padding: 20px;
                text-align: center;
            `;
            
            const icon = this.createElement('div', {
                'class': 'preview-fallback-icon'
            }, ['🔗']);
            
            icon.style.cssText = `
                font-size: 24px;
                margin-bottom: 8px;
            `;
            
            const title = this.createElement('div', {
                'class': 'preview-fallback-title'
            }, [metadata.title]);
            
            title.style.cssText = `
                font-size: 14px;
                font-weight: 600;
                margin-bottom: 4px;
            `;
            
            const domain = this.createElement('div', {
                'class': 'preview-fallback-domain'
            }, [metadata.domain]);
            
            domain.style.cssText = `
                font-size: 12px;
            `;
            
            fallback.appendChild(icon);
            fallback.appendChild(title);
            fallback.appendChild(domain);
            
            return fallback;
        }
        
        static createLoading() {
            const loading = this.createElement('div', {
                'class': 'link-preview-loading'
            });
            
            loading.style.cssText = `
                height: 180px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: var(--bg-secondary, #f5f5f5);
                border-radius: 8px;
                border: 2px dashed var(--border-color, #e0e0e0);
            `;
            
            const spinner = this.createElement('div', {
                'class': 'preview-spinner'
            });
            
            spinner.style.cssText = `
                width: 24px;
                height: 24px;
                border: 3px solid var(--border-color, #e0e0e0);
                border-top-color: var(--primary-color, #0066cc);
                border-radius: 50%;
                animation: preview-spin 1s linear infinite;
            `;
            
            const text = this.createElement('div', {
                'class': 'preview-loading-text'
            }, ['Carregando...']);
            
            text.style.cssText = `
                margin-left: 12px;
                font-size: 14px;
                color: var(--text-muted, #666);
            `;
            
            const content = this.createElement('div', {
                'class': 'preview-loading-content'
            });
            
            content.style.cssText = `
                display: flex;
                align-items: center;
            `;
            
            content.appendChild(spinner);
            content.appendChild(text);
            loading.appendChild(content);
            
            return loading;
        }
        
        static createError(message) {
            const error = this.createElement('div', {
                'class': 'link-preview-error'
            });
            
            error.style.cssText = `
                padding: 12px;
                background: var(--error-bg, #fee);
                border: 1px solid var(--error-border, #fcc);
                border-radius: 6px;
                color: var(--error-text, #c00);
                font-size: 13px;
                text-align: center;
            `;
            
            const icon = this.createElement('span', {
                'class': 'preview-error-icon'
            }, ['⚠️']);
            
            icon.style.cssText = `
                margin-right: 6px;
            `;
            
            const text = this.createElement('span', {
                'class': 'preview-error-text'
            }, [SecurityService.sanitizeText(message)]);
            
            error.appendChild(icon);
            error.appendChild(text);
            
            return error;
        }
    }
    
    // ====================================================
    // 5. GERENCIADOR PRINCIPAL OTIMIZADO
    // ====================================================
    class PreviewManager {
        constructor() {
            this.service = new PreviewService();
            this.activeRequests = new WeakMap();
            this.observer = null;
            this.init();
        }
        
        init() {
            logger.log('Inicializando Preview Manager');
            
            // Conectividade
            window.addEventListener('online', this.handleOnline.bind(this));
            window.addEventListener('offline', this.handleOffline.bind(this));
            
            // Processa existentes
            this.processCards();
            
            // Observador para novos cards
            this.setupObserver();
            
            // Adiciona estilos
            this.addStyles();
        }
        
        handleOnline() {
            STATE.isOnline = true;
            logger.log('Conectado - retomando operações');
        }
        
        handleOffline() {
            STATE.isOnline = false;
            logger.warn('Desconectado - modo offline ativado');
        }
        
        setupObserver() {
            if (!window.MutationObserver) return;
            
            this.observer = new MutationObserver((mutations) => {
                for (const mutation of mutations) {
                    if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach(node => {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                const cards = node.querySelectorAll ? node.querySelectorAll('.anuncio-card, [data-preview]') : [];
                                cards.forEach(card => this.setupCard(card));
                                
                                if (node.matches('.anuncio-card, [data-preview]')) {
                                    this.setupCard(node);
                                }
                            }
                        });
                    }
                }
            });
            
            // Observa apenas containers específicos
            const containers = document.querySelectorAll('.cards-container, #ads-container, .anuncios-grid');
            containers.forEach(container => {
                this.observer.observe(container, {
                    childList: true,
                    subtree: true
                });
            });
        }
        
        processCards() {
            const cards = document.querySelectorAll('.anuncio-card, [data-preview]');
            
            cards.forEach((card, index) => {
                // Delay escalonado
                setTimeout(() => this.setupCard(card), index * 200);
            });
        }
        
        setupCard(card) {
            if (card.dataset.previewSetup === 'true') return;
            
            const input = card.querySelector('.link-input, input[type="url"]');
            const container = card.querySelector('.preview-container, [data-preview-container]');
            
            if (!input || !container) {
                return;
            }
            
            card.dataset.previewSetup = 'true';
            
            // Configura eventos
            this.setupInputEvents(input, container);
            
            // Processa valor existente
            if (input.value && SecurityService.isValidUrl(input.value)) {
                setTimeout(() => {
                    this.processUrl(input.value, container);
                }, 300);
            }
        }
        
        setupInputEvents(input, container) {
            let timeout;
            
            const handler = () => {
                clearTimeout(timeout);
                
                timeout = setTimeout(() => {
                    const url = input.value.trim();
                    this.processUrl(url, container);
                }, CONFIG.debounceTime);
            };
            
            input.addEventListener('input', handler);
            input.addEventListener('blur', () => {
                clearTimeout(timeout);
                const url = input.value.trim();
                this.processUrl(url, container);
            });
        }
        
        async processUrl(url, container) {
            // Limpa container se URL vazia
            if (!url) {
                container.innerHTML = '';
                return;
            }
            
            // Valida URL
            if (!SecurityService.isValidUrl(url)) {
                if (url.length > 5) {
                    container.innerHTML = '';
                    container.appendChild(RenderService.createError(
                        'URL inválida. Use formato: https://exemplo.com'
                    ));
                }
                return;
            }
            
            // Cancela request anterior para este container
            const previousRequest = this.activeRequests.get(container);
            if (previousRequest && typeof previousRequest.abort === 'function') {
                previousRequest.abort();
            }
            
            // Mostra loading
            container.innerHTML = '';
            container.appendChild(RenderService.createLoading());
            
            try {
                const metadata = await this.service.getPreview(url);
                
                // Verifica se ainda é o container atual
                if (container.parentNode) {
                    container.innerHTML = '';
                    container.appendChild(RenderService.createPreview(metadata));
                }
                
            } catch (error) {
                if (error.name === 'AbortError') {
                    // Request cancelado, ignora
                    return;
                }
                
                logger.warn('Erro ao processar URL:', error.message);
                
                if (container.parentNode) {
                    container.innerHTML = '';
                    
                    const errorMessage = STATE.isOnline 
                        ? 'Não foi possível carregar o preview' 
                        : 'Sem conexão. Usando cache...';
                    
                    container.appendChild(RenderService.createError(errorMessage));
                }
            }
        }
        
        addStyles() {
            const styles = `
                @keyframes preview-spin {
                    to { transform: rotate(360deg); }
                }
                
                .link-preview:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
                
                .dark-mode .link-preview {
                    background: #2a2a2a;
                    border-color: #444;
                }
                
                .dark-mode .link-preview-loading {
                    background: #2a2a2a;
                    border-color: #444;
                }
                
                .dark-mode .link-preview-error {
                    background: rgba(255, 0, 0, 0.1);
                    border-color: rgba(255, 0, 0, 0.3);
                    color: #ff6b6b;
                }
                
                @media (max-width: 768px) {
                    .link-preview {
                        margin-bottom: 8px;
                    }
                }
            `;
            
            const styleEl = document.createElement('style');
            styleEl.textContent = styles;
            document.head.appendChild(styleEl);
        }
        
        destroy() {
            if (this.observer) {
                this.observer.disconnect();
            }
            
            this.activeRequests.clear();
            
            window.removeEventListener('online', this.handleOnline);
            window.removeEventListener('offline', this.handleOffline);
        }
    }
    
    // ====================================================
    // 6. INICIALIZAÇÃO
    // ====================================================
    function initialize() {
        // Verifica requisitos
        if (!window.fetch || !window.URL) {
            logger.error('APIs necessárias não suportadas');
            return;
        }
        
        // Inicializa com delay para garantir DOM
        setTimeout(() => {
            try {
                window.previewManager = new PreviewManager();
                logger.log('Preview Manager inicializado');
            } catch (error) {
                logger.error('Falha na inicialização:', error);
            }
        }, 100);
    }
    
    // Auto-inicialização
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
    
    // API pública simplificada
    window.LinkPreview = {
        get: async (url) => {
            const service = new PreviewService();
            return await service.getPreview(url);
        },
        clearCache: () => {
            const cache = new SecureCache();
            cache.clear();
        },
        refresh: () => {
            if (window.previewManager) {
                window.previewManager.processCards();
            }
        }
    };
    
})();