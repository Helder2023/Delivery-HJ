// Configurações otimizadas
const CONFIG = {
    // Múltiplos proxies para fallback
    corsProxies: [
        'https://cors-anywhere.herokuapp.com/',
        'https://api.allorigins.win/raw?url=',
        'https://proxy.cors.sh/'
    ],
    currentProxyIndex: 0,
    debounceTime: 1500, // Aumentado para evitar requisições desnecessárias
    minUrlLength: 12,
    timeout: 8000, // Reduzido
    maxCacheAge: 30 * 60 * 1000, // 30 minutos
    lazyLoad: true,
    useLocalStorage: true // Cache em localStorage
};

// Cache em memória
const memoryCache = new Map();

// Cache em localStorage (se disponível)
const storageCache = {
    get: (key) => {
        if (!CONFIG.useLocalStorage || !window.localStorage) return null;
        try {
            const item = localStorage.getItem(`preview_${btoa(key)}`);
            if (!item) return null;
            
            const data = JSON.parse(item);
            // Verifica se o cache não expirou
            if (Date.now() - data.timestamp > CONFIG.maxCacheAge) {
                localStorage.removeItem(`preview_${btoa(key)}`);
                return null;
            }
            return data.metadata;
        } catch {
            return null;
        }
    },
    
    set: (key, metadata) => {
        if (!CONFIG.useLocalStorage || !window.localStorage) return;
        try {
            const data = {
                metadata,
                timestamp: Date.now()
            };
            localStorage.setItem(`preview_${btoa(key)}`, JSON.stringify(data));
        } catch (e) {
            console.warn('Não foi possível salvar no localStorage:', e);
        }
    },
    
    clear: () => {
        if (!window.localStorage) return;
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('preview_')) {
                localStorage.removeItem(key);
            }
        });
    }
};

// Debounce otimizado
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const context = this;
        const later = () => {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

// Validação RÁPIDA de URL
function isValidUrl(string) {
    if (!string || string.length < CONFIG.minUrlLength) return false;
    
    // Verificação rápida com regex
    const quickCheck = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
    if (!quickCheck.test(string)) return false;
    
    // Verificação mais precisa mas ainda rápida
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

// Extrai apenas metadados ESSENCIAIS (mais rápido)
function extractEssentialMetadata(html, url) {
    // Limita o tamanho do HTML processado
    const limitedHtml = html.substring(0, 50000); // Processa apenas os primeiros 50KB
    
    // Busca rápida por tags usando indexOf (mais rápido que DOM parsing)
    const extractMeta = (property) => {
        const propertyIndex = limitedHtml.indexOf(`property="${property}"`);
        const nameIndex = limitedHtml.indexOf(`name="${property}"`);
        
        let index = propertyIndex > -1 ? propertyIndex : nameIndex;
        if (index === -1) return null;
        
        // Encontra o conteúdo
        const contentStart = limitedHtml.indexOf('content="', index);
        if (contentStart === -1) return null;
        
        const contentValueStart = contentStart + 9;
        const contentValueEnd = limitedHtml.indexOf('"', contentValueStart);
        
        if (contentValueEnd === -1) return null;
        
        return limitedHtml.substring(contentValueStart, contentValueEnd)
            .replace(/&quot;/g, '"')
            .replace(/&amp;/g, '&')
            .trim();
    };
    
    // Título
    let title = extractMeta('og:title') || extractMeta('twitter:title');
    if (!title) {
        const titleStart = limitedHtml.indexOf('<title>');
        const titleEnd = limitedHtml.indexOf('</title>');
        if (titleStart > -1 && titleEnd > -1) {
            title = limitedHtml.substring(titleStart + 7, titleEnd)
                .replace(/<[^>]*>/g, '')
                .trim()
                .substring(0, 100);
        }
    }
    
    // Descrição
    let description = extractMeta('og:description') || 
                     extractMeta('twitter:description') || 
                     extractMeta('description');
    
    // Imagem
    let image = extractMeta('og:image') || extractMeta('twitter:image');
    
    // Se não encontrou imagem, tenta uma busca simples por src="
    if (!image) {
        const imgSrcMatch = limitedHtml.match(/src="(https?:\/\/[^"]+\.(jpg|jpeg|png|gif|webp)[^"]*)"/i);
        if (imgSrcMatch && imgSrcMatch[1]) {
            image = imgSrcMatch[1];
        }
    }
    
    // Processa URLs relativas
    if (image && !image.startsWith('http')) {
        if (image.startsWith('//')) {
            image = 'https:' + image;
        } else if (image.startsWith('/')) {
            const baseUrl = new URL(url);
            image = baseUrl.origin + image;
        }
    }
    
    return {
        title: title ? title.substring(0, 100) : new URL(url).hostname,
        description: description ? description.substring(0, 150) : '',
        image: image || '',
        url: url,
        domain: new URL(url).hostname.replace('www.', '')
    };
}

// Sistema de fallback para proxies
async function fetchWithProxyFallback(url) {
    let lastError;
    
    for (let i = 0; i < CONFIG.corsProxies.length; i++) {
        const proxyIndex = (CONFIG.currentProxyIndex + i) % CONFIG.corsProxies.length;
        const proxyUrl = CONFIG.corsProxies[proxyIndex] + encodeURIComponent(url);
        
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), CONFIG.timeout);
            
            const response = await fetch(proxyUrl, {
                signal: controller.signal,
                headers: {
                    'User-Agent': 'Mozilla/5.0',
                    'Accept': 'text/html,application/xhtml+xml'
                }
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
                CONFIG.currentProxyIndex = proxyIndex; // Usa este proxy para as próximas
                const html = await response.text();
                return html;
            }
            
            throw new Error(`Proxy ${proxyIndex} falhou: HTTP ${response.status}`);
            
        } catch (error) {
            lastError = error;
            console.warn(`Proxy ${proxyIndex} falhou, tentando próximo...`);
            // Continua para o próximo proxy
        }
    }
    
    throw lastError || new Error('Todos os proxies falharam');
}

// Busca preview com timeout e otimizações
async function fetchPreview(url) {
    const cacheKey = url.toLowerCase();
    
    // 1. Verifica cache em memória
    if (memoryCache.has(cacheKey)) {
        return memoryCache.get(cacheKey);
    }
    
    // 2. Verifica cache em localStorage
    const cached = storageCache.get(cacheKey);
    if (cached) {
        memoryCache.set(cacheKey, cached);
        return cached;
    }
    
    // 3. Se for imagem direta ou YouTube, retorna metadados simples
    if (url.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i)) {
        const metadata = {
            title: 'Imagem',
            description: '',
            image: url,
            url: url,
            domain: new URL(url).hostname.replace('www.', '')
        };
        cachePreview(cacheKey, metadata);
        return metadata;
    }
    
    // YouTube thumbnail
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        let videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
        if (videoId && videoId[1]) {
            const metadata = {
                title: 'Vídeo do YouTube',
                description: '',
                image: `https://img.youtube.com/vi/${videoId[1]}/hqdefault.jpg`,
                url: url,
                domain: 'youtube.com'
            };
            cachePreview(cacheKey, metadata);
            return metadata;
        }
    }
    
    // 4. Tenta buscar do servidor com fallback
    try {
        const html = await fetchWithProxyFallback(url);
        const metadata = extractEssentialMetadata(html, url);
        
        // Cache
        cachePreview(cacheKey, metadata);
        
        return metadata;
        
    } catch (error) {
        console.warn('Falha ao buscar preview, usando fallback:', error);
        
        // Fallback: metadados básicos baseados na URL
        const fallbackMetadata = {
            title: new URL(url).hostname.replace('www.', ''),
            description: 'Clique para visitar o site',
            image: `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=128`,
            url: url,
            domain: new URL(url).hostname.replace('www.', '')
        };
        
        cachePreview(cacheKey, fallbackMetadata);
        return fallbackMetadata;
    }
}

// Cache unificado
function cachePreview(key, metadata) {
    memoryCache.set(key, metadata);
    storageCache.set(key, metadata);
    
    // Limita cache em memória (LRU aproximado)
    if (memoryCache.size > 100) {
        const firstKey = memoryCache.keys().next().value;
        memoryCache.delete(firstKey);
    }
}

// Mostra preview de forma otimizada
function showPreview(card, metadata) {
    const previewContainer = card.querySelector('.preview-container');
    const linkElement = card.querySelector('a[target="_blank"]');
    
    // Atualiza link
    if (linkElement) {
        linkElement.href = metadata.url;
        linkElement.textContent = metadata.domain;
        linkElement.title = metadata.title;
    }
    
    // Renderização otimizada
    if (metadata.image && metadata.image !== '') {
        previewContainer.innerHTML = `
            <div style="position: relative; height: 180px; overflow: hidden; border-radius: 4px;">
                <img 
                    src="${metadata.image}" 
                    alt="${metadata.title}"
                    style="width: 100%; height: 100%; object-fit: cover;"
                    loading="lazy"
                    onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'padding: 20px; background: #f8f9fa; height: 100%; display: flex; flex-direction: column; justify-content: center;\\'><strong>${metadata.title}</strong><small style=\\'color: #666; margin-top: 5px; display: block;\\'>${metadata.description || metadata.domain}</small></div>'"
                >
                <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.7)); color: white; padding: 10px;">
                    <div style="font-size: 12px; font-weight: bold;">${metadata.title.substring(0, 60)}</div>
                    <div style="font-size: 10px; opacity: 0.9;">${metadata.domain}</div>
                </div>
            </div>
        `;
    } else {
        previewContainer.innerHTML = `
            <div style="padding: 15px; background: #f8f9fa; border-radius: 4px; height: 180px; display: flex; flex-direction: column; justify-content: center;">
                <div style="display: flex; align-items: center; margin-bottom: 10px;">
                    <img 
                        src="https://www.google.com/s2/favicons?domain=${metadata.domain}&sz=32" 
                        style="width: 16px; height: 16px; margin-right: 8px;"
                        onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 rx=%2220%22 fill=%22%234285f4%22/><text x=%2250%22 y=%2260%22 font-size=%2240%22 text-anchor=%22middle%22 fill=%22white%22>${metadata.domain.charAt(0).toUpperCase()}</text></svg>'"
                    >
                    <span style="font-size: 12px; color: #666;">${metadata.domain}</span>
                </div>
                <div style="font-weight: bold; margin-bottom: 5px; font-size: 14px;">${metadata.title}</div>
                ${metadata.description ? `<div style="font-size: 12px; color: #666; line-height: 1.3;">${metadata.description}</div>` : ''}
            </div>
        `;
    }
}

// Mostra loading simples
function showLoading(card) {
    const previewContainer = card.querySelector('.preview-container');
    previewContainer.innerHTML = `
        <div style="height: 180px; display: flex; align-items: center; justify-content: center; background: #f8f9fa; border-radius: 4px;">
            <div style="text-align: center;">
                <div class="spinner-border spinner-border-sm text-primary" role="status">
                    <span class="visually-hidden">Carregando...</span>
                </div>
                <div style="font-size: 12px; color: #666; margin-top: 8px;">Carregando...</div>
            </div>
        </div>
    `;
}

// Processamento principal
async function processLinkOptimized(input) {
    const url = input.value.trim();
    const card = input.closest('.anuncio-card');
    
    // Limpa se vazio
    if (!url) {
        card.querySelector('.preview-container').innerHTML = '';
        return;
    }
    
    // Validação rápida
    if (!isValidUrl(url)) {
        if (url.length > 5) {
            card.querySelector('.preview-container').innerHTML = `
                <div style="padding: 10px; background: #fff3cd; color: #856404; border-radius: 4px; font-size: 12px;">
                    URL inválida. Use https://exemplo.com
                </div>
            `;
        }
        return;
    }
    
    // Mostra loading
    showLoading(card);
    
    // Usa requestIdleCallback se disponível para não bloquear a UI
    if ('requestIdleCallback' in window) {
        requestIdleCallback(async () => {
            try {
                const metadata = await fetchPreview(url);
                showPreview(card, metadata);
            } catch (error) {
                showPreview(card, {
                    title: 'Erro ao carregar',
                    description: 'Tente novamente',
                    image: '',
                    url: url,
                    domain: new URL(url).hostname.replace('www.', '')
                });
            }
        }, { timeout: 1000 });
    } else {
        // Fallback para browsers mais antigos
        setTimeout(async () => {
            try {
                const metadata = await fetchPreview(url);
                showPreview(card, metadata);
            } catch (error) {
                showPreview(card, {
                    title: 'Erro ao carregar',
                    description: 'Tente novamente',
                    image: '',
                    url: url,
                    domain: new URL(url).hostname.replace('www.', '')
                });
            }
        }, 100);
    }
}

// Inicialização otimizada
function initializeOptimizedPreview() {
    console.log('🚀 Inicializando Preview Otimizado...');
    
    // Configura performance
    CONFIG.useLocalStorage = 'localStorage' in window;
    
    // Encontra ou cria inputs
    const cards = document.querySelectorAll('.anuncio-card');
    
    cards.forEach((card, index) => {
        // Tenta encontrar input existente
        let input = card.querySelector('.link-input');
        let linkAnchor = card.querySelector('a[target="_blank"]');
        
        // Se não tem input mas tem link, cria input
        if (!input && linkAnchor) {
            // Guarda o link original
            const originalHref = linkAnchor.href;
            
            // Cria input
            input = document.createElement('input');
            input.type = 'url';
            input.className = 'link-input form-control mt-2';
            input.placeholder = 'https://exemplo.com';
            input.value = originalHref && originalHref !== 'http://' ? originalHref : '';
            input.style.cssText = `
                width: 100%;
                padding: 6px 8px;
                border: 1px solid #ced4da;
                border-radius: 4px;
                font-size: 14px;
                transition: border-color 0.15s;
                box-sizing: border-box;
            `;
            
            // Insere antes do link
            linkAnchor.parentNode.insertBefore(input, linkAnchor);
            
            // Esconde link original
            linkAnchor.style.display = 'none';
        }
        
        // Se tem input, configura eventos
        if (input) {
            // Cria container de preview se não existir
            let previewContainer = card.querySelector('.preview-container');
            if (!previewContainer) {
                // Tenta substituir a imagem existente
                const img = card.querySelector('img.card-img-top');
                if (img) {
                    previewContainer = document.createElement('div');
                    previewContainer.className = 'preview-container';
                    img.parentNode.replaceChild(previewContainer, img);
                } else {
                    // Ou cria no topo do card
                    previewContainer = document.createElement('div');
                    previewContainer.className = 'preview-container';
                    card.insertBefore(previewContainer, card.firstChild);
                }
            }
            
            // Configura eventos com debounce
            const debouncedProcess = debounce(
                () => processLinkOptimized(input), 
                CONFIG.debounceTime
            );
            
            input.addEventListener('input', debouncedProcess);
            
            // Processa link existente após um delay
            if (input.value && isValidUrl(input.value)) {
                setTimeout(() => debouncedProcess(), 500 + (index * 300)); // Stagger requests
            }
            
            // Adiciona dica visual
            input.title = 'Cole um link e aguarde a preview automática';
        }
    });
    
    console.log(`✅ Preview otimizado para ${cards.length} cards`);
    
    // Limpeza de cache antigo
    if (CONFIG.useLocalStorage) {
        setTimeout(() => storageCache.clear(), 24 * 60 * 60 * 1000); // Limpa diário
    }
}

// Inicializa
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeOptimizedPreview);
} else {
    setTimeout(initializeOptimizedPreview, 0);
}

// API pública
window.FastLinkPreview = {
    process: (input) => processLinkOptimized(input),
    preload: (url) => fetchPreview(url),
    clearCache: () => {
        memoryCache.clear();
        storageCache.clear();
    },
    enable: () => CONFIG.useLocalStorage = true,
    disable: () => CONFIG.useLocalStorage = false
};