// ====================================================
// 🛡️ RESILIÊNCIA TOTAL - PACOTE ANTI-BUGS
// ====================================================
// Coloque este arquivo como PRIMEIRO script no seu HTML:
// <script src="/js/resilience.js" defer></script>
// ====================================================

(function() {
  'use strict';

  // ====================================================
  // 1. CONFIGURAÇÃO GLOBAL
  // ====================================================
  const CONFIG = {
    debug: false,
    logErrors: true,
    autoRecover: true,
    maxRecoveryAttempts: 3,
    healthCheckInterval: 30000, // 30 segundos
    fallbackMode: false
  };

  // ====================================================
  // 2. SISTEMA DE LOG AVANÇADO
  // ====================================================
  const Logger = {
    log: (message, data = null) => {
      if (CONFIG.debug) {
        console.log(`[RESILIENCE] ${message}`, data || '');
      }
    },
    
    warn: (message, data = null) => {
      console.warn(`[RESILIENCE] ⚠️ ${message}`, data || '');
      this.trackError('warning', message, data);
    },
    
    error: (message, data = null) => {
      console.error(`[RESILIENCE] 🔴 ${message}`, data || '');
      this.trackError('error', message, data);
    },
    
    trackError: (type, message, data) => {
      const errorData = {
        type,
        message,
        data,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        memory: performance.memory ? {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize
        } : null
      };
      
      // Armazenar localmente
      this.storeError(errorData);
      
      // Enviar para servidor (se online)
      this.reportToServer(errorData);
    },
    
    storeError: (errorData) => {
      try {
        const stored = JSON.parse(localStorage.getItem('resilience_errors') || '[]');
        stored.push(errorData);
        if (stored.length > 50) stored.shift(); // Mantém apenas últimos 50
        localStorage.setItem('resilience_errors', JSON.stringify(stored));
      } catch (e) {
        // Silencioso
      }
    },
    
    reportToServer: (errorData) => {
      if (!navigator.onLine) return;
      
      fetch('/api/log-client-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData),
        keepalive: true // Funciona mesmo ao fechar página
      }).catch(() => {
        // Falha silenciosa
      });
    }
  };

  // ====================================================
  // 3. MONITOR DE DEPENDÊNCIAS CRÍTICAS
  // ====================================================
  class DependencyMonitor {
    constructor() {
      this.dependencies = new Map();
      this.loaded = new Set();
      this.failed = new Set();
    }
    
    register(name, checkFn, fallbackUrl = null, isCritical = false) {
      this.dependencies.set(name, { checkFn, fallbackUrl, isCritical });
    }
    
    checkAll() {
      const results = {};
      
      for (const [name, dep] of this.dependencies) {
        try {
          const isAvailable = dep.checkFn();
          results[name] = { available: isAvailable };
          
          if (isAvailable) {
            this.loaded.add(name);
            this.failed.delete(name);
          } else {
            this.failed.add(name);
            this.loaded.delete(name);
            
            if (dep.isCritical) {
              Logger.warn(`Dependência crítica faltando: ${name}`);
              this.loadFallback(name, dep.fallbackUrl);
            }
          }
        } catch (error) {
          results[name] = { available: false, error: error.message };
          this.failed.add(name);
          Logger.error(`Erro ao verificar ${name}:`, error);
        }
      }
      
      return results;
    }
    
    loadFallback(name, fallbackUrl) {
      if (!fallbackUrl) return;
      
      Logger.log(`Carregando fallback para: ${name}`);
      
      if (fallbackUrl.endsWith('.js')) {
        this.loadScript(fallbackUrl);
      } else if (fallbackUrl.endsWith('.css')) {
        this.loadStyle(fallbackUrl);
      }
    }
    
    loadScript(url) {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = () => {
          Logger.log(`Fallback carregado: ${url}`);
          resolve();
        };
        script.onerror = () => {
          Logger.error(`Falha ao carregar fallback: ${url}`);
          resolve();
        };
        document.head.appendChild(script);
      });
    }
    
    loadStyle(url) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      document.head.appendChild(link);
    }
    
    isHealthy() {
      const criticalDeps = Array.from(this.dependencies.entries())
        .filter(([_, dep]) => dep.isCritical)
        .map(([name]) => name);
      
      return criticalDeps.every(dep => this.loaded.has(dep));
    }
  }

  // ====================================================
  // 4. CAPTURADOR DE ERROS GLOBAL
  // ====================================================
  class GlobalErrorHandler {
    constructor() {
      this.handledErrors = new Set();
      this.recoveryQueue = [];
      this.init();
    }
    
    init() {
      // Captura erros globais do JavaScript
      window.addEventListener('error', (event) => {
        this.handleError(event.error || event.message, {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          type: 'global_error'
        });
        
        if (CONFIG.autoRecover) {
          this.scheduleRecovery();
        }
        
        // Previne que o erro apareça no console nativo
        if (this.shouldSuppressError(event)) {
          event.preventDefault();
        }
      });
      
      // Captura rejeições de Promises não tratadas
      window.addEventListener('unhandledrejection', (event) => {
        this.handleError(event.reason, {
          type: 'unhandled_rejection',
          promise: event.promise
        });
      });
      
      // Captura erros de recursos (imagens, scripts, etc.)
      window.addEventListener('error', (event) => {
        const target = event.target;
        if (target && (target.tagName === 'IMG' || target.tagName === 'SCRIPT' || target.tagName === 'LINK')) {
          this.handleResourceError(target);
        }
      }, true);
      
      // Monitora memória
      this.startMemoryMonitor();
    }
    
    handleError(error, metadata = {}) {
      const errorId = this.generateErrorId(error, metadata);
      
      if (this.handledErrors.has(errorId)) {
        return; // Já foi tratado
      }
      
      this.handledErrors.add(errorId);
      
      const errorData = {
        message: error.message || String(error),
        stack: error.stack,
        ...metadata,
        timestamp: new Date().toISOString()
      };
      
      Logger.error('Erro capturado:', errorData);
      
      // Tenta recuperação automática
      if (CONFIG.autoRecover) {
        this.attemptRecovery(errorData);
      }
      
      // Mostra feedback amigável ao usuário
      this.showUserFriendlyError(errorData);
      
      // Limita quantidade de erros armazenados
      if (this.handledErrors.size > 100) {
        const first = this.handledErrors.values().next().value;
        this.handledErrors.delete(first);
      }
    }
    
    handleResourceError(element) {
      const tag = element.tagName;
      const src = element.src || element.href;
      
      Logger.warn(`Falha ao carregar recurso ${tag}: ${src}`);
      
      // Tratamento específico para imagens
      if (tag === 'IMG') {
        element.onerror = null; // Previne loop
        element.style.opacity = '0.5';
        element.style.filter = 'grayscale(100%)';
        
        // Tenta carregar fallback
        setTimeout(() => {
          if (!element.complete || element.naturalHeight === 0) {
            element.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f0f0f0"/><text x="50" y="50" font-family="Arial" font-size="10" text-anchor="middle" dy=".3em" fill="%23999">Imagem não carregada</text></svg>';
          }
        }, 1000);
      }
    }
    
    attemptRecovery(errorData) {
      const recoveryAction = this.identifyRecoveryAction(errorData);
      
      if (recoveryAction) {
        Logger.log(`Tentando recuperação: ${recoveryAction.type}`);
        
        switch (recoveryAction.type) {
          case 'reload_component':
            this.reloadComponent(recoveryAction.selector);
            break;
          case 'clear_storage':
            this.clearProblematicStorage();
            break;
          case 'fallback_mode':
            this.activateFallbackMode();
            break;
          case 'soft_reload':
            this.softReload();
            break;
        }
      }
    }
    
    identifyRecoveryAction(errorData) {
      const errorMsg = errorData.message.toLowerCase();
      const errorStack = errorData.stack || '';
      
      if (errorMsg.includes('localstorage') || errorMsg.includes('sessionstorage')) {
        return { type: 'clear_storage' };
      }
      
      if (errorMsg.includes('bootstrap') || errorMsg.includes('jquery') || errorMsg.includes('datatable')) {
        return { type: 'reload_component', selector: 'bootstrap' };
      }
      
      if (errorMsg.includes('fetch') || errorMsg.includes('network') || errorMsg.includes('ajax')) {
        return { type: 'fallback_mode' };
      }
      
      if (errorStack.includes('router') || errorStack.includes('hashchange')) {
        return { type: 'soft_reload' };
      }
      
      return null;
    }
    
    reloadComponent(selector) {
      setTimeout(() => {
        if (selector === 'bootstrap' && typeof bootstrap !== 'undefined') {
          try {
            // Re-inicializa todos os componentes Bootstrap
            document.querySelectorAll('[data-bs-toggle]').forEach(el => {
              try {
                if (el.getAttribute('data-bs-toggle') === 'dropdown') {
                  new bootstrap.Dropdown(el);
                } else if (el.getAttribute('data-bs-toggle') === 'modal') {
                  new bootstrap.Modal(el);
                } else if (el.getAttribute('data-bs-toggle') === 'tooltip') {
                  new bootstrap.Tooltip(el);
                }
              } catch (e) {
                // Ignora erros individuais
              }
            });
            Logger.log('Componentes Bootstrap reinicializados');
          } catch (e) {
            Logger.error('Falha ao reinicializar Bootstrap:', e);
          }
        }
      }, 1000);
    }
    
    clearProblematicStorage() {
      try {
        // Limpa apenas chaves problemáticas, não tudo
        const keys = Object.keys(localStorage);
        const problematic = keys.filter(key => 
          key.includes('temp') || 
          key.includes('cache') || 
          key.includes('session')
        );
        
        problematic.forEach(key => {
          localStorage.removeItem(key);
        });
        
        Logger.log(`Armazenamento limpo: ${problematic.length} chaves removidas`);
      } catch (e) {
        // Não faz nada se falhar
      }
    }
    
    activateFallbackMode() {
      CONFIG.fallbackMode = true;
      document.body.classList.add('fallback-mode');
      Logger.log('Modo fallback ativado');
    }
    
    softReload() {
      if (performance.navigation.type === 1) {
        // Já é um reload, não faz nada
        return;
      }
      
      setTimeout(() => {
        window.location.hash = window.location.hash || '#/';
        Logger.log('Soft reload executado');
      }, 2000);
    }
    
    showUserFriendlyError(errorData) {
      // Remove notificações antigas
      const old = document.querySelector('.resilience-notification');
      if (old) old.remove();
      
      // Cria notificação não intrusiva
      const notification = document.createElement('div');
      notification.className = 'resilience-notification';
      notification.innerHTML = `
        <div style="
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: rgba(255, 71, 87, 0.95);
          color: white;
          padding: 12px 16px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 999999;
          max-width: 300px;
          font-size: 14px;
          backdrop-filter: blur(10px);
          border-left: 4px solid #ff4757;
          animation: slideInRight 0.3s ease;
        ">
          <div style="display: flex; align-items: flex-start; gap: 10px;">
            <div style="font-size: 18px;">⚠️</div>
            <div>
              <div style="font-weight: bold; margin-bottom: 4px;">Ops, algo deu errado</div>
              <div style="opacity: 0.9; font-size: 13px; margin-bottom: 8px;">
                Estamos trabalhando para corrigir isso.
              </div>
              <div style="display: flex; gap: 8px; margin-top: 8px;">
                <button onclick="this.closest('.resilience-notification').remove()" style="
                  background: transparent;
                  border: 1px solid rgba(255,255,255,0.3);
                  color: white;
                  padding: 4px 12px;
                  border-radius: 4px;
                  font-size: 12px;
                  cursor: pointer;
                ">Ignorar</button>
                <button onclick="window.location.reload()" style="
                  background: white;
                  color: #ff4757;
                  border: none;
                  padding: 4px 12px;
                  border-radius: 4px;
                  font-size: 12px;
                  font-weight: bold;
                  cursor: pointer;
                ">Recarregar</button>
              </div>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(notification);
      
      // Remove automaticamente após 10 segundos
      setTimeout(() => {
        if (notification.parentNode) {
          notification.style.opacity = '0';
          notification.style.transform = 'translateX(100%)';
          setTimeout(() => notification.remove(), 300);
        }
      }, 10000);
    }
    
    generateErrorId(error, metadata) {
      const msg = error.message || String(error);
      const stack = error.stack || '';
      return btoa(msg.substring(0, 50) + stack.substring(0, 50) + metadata.type);
    }
    
    shouldSuppressError(event) {
      // Suprime apenas erros específicos conhecidos
      const errorMsg = event.message || '';
      const suppressions = [
        'bootstrap',
        'datatable',
        'feather',
        'script error',
        'resilience.js'
      ];
      
      return suppressions.some(s => errorMsg.toLowerCase().includes(s.toLowerCase()));
    }
    
    startMemoryMonitor() {
      if (!performance.memory) return;
      
      setInterval(() => {
        const memory = performance.memory;
        const usedPercent = (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100;
        
        if (usedPercent > 90) {
          Logger.warn('Uso alto de memória detectado', {
            usedPercent: Math.round(usedPercent),
            usedMB: Math.round(memory.usedJSHeapSize / 1024 / 1024),
            totalMB: Math.round(memory.totalJSHeapSize / 1024 / 1024)
          });
          
          // Limpa caches se memória muito alta
          if (usedPercent > 95) {
            this.clearMemoryCaches();
          }
        }
      }, 60000); // Verifica a cada minuto
    }
    
    clearMemoryCaches() {
      // Limpa caches de imagens
      document.querySelectorAll('img').forEach(img => {
        if (!img.dataset.important) {
          img.src = '';
        }
      });
      
      // Força garbage collection (se suportado)
      if (window.gc) {
        window.gc();
      }
    }
  }

  // ====================================================
  // 5. VERIFICADOR DE PERFORMANCE
  // ====================================================
  class PerformanceGuard {
    constructor() {
      this.metrics = {};
      this.thresholds = {
        pageLoad: 5000, // 5 segundos
        apiCall: 3000,  // 3 segundos
        render: 1000,   // 1 segundo
        fps: 30         // 30 FPS mínimo
      };
      
      this.init();
    }
    
    init() {
      // Mede tempo de carregamento
      window.addEventListener('load', () => {
        this.metrics.pageLoad = performance.now();
        this.checkPageLoad();
      });
      
      // Monitora FPS
      this.startFPSMonitor();
      
      // Monitora requisições de rede
      this.monitorNetwork();
    }
    
    checkPageLoad() {
      if (this.metrics.pageLoad > this.thresholds.pageLoad) {
        Logger.warn('Carregamento lento da página', {
          loadTime: Math.round(this.metrics.pageLoad),
          threshold: this.thresholds.pageLoad
        });
        
        // Sugere otimizações
        this.suggestOptimizations();
      }
    }
    
    startFPSMonitor() {
      let lastTime = performance.now();
      let frames = 0;
      
      const checkFPS = () => {
        const current = performance.now();
        frames++;
        
        if (current >= lastTime + 1000) {
          const fps = Math.round((frames * 1000) / (current - lastTime));
          
          if (fps < this.thresholds.fps) {
            Logger.warn('Baixo FPS detectado', { fps });
            this.triggerPerformanceMode();
          }
          
          frames = 0;
          lastTime = current;
        }
        
        requestAnimationFrame(checkFPS);
      };
      
      requestAnimationFrame(checkFPS);
    }
    
    triggerPerformanceMode() {
      // Ativa modo de baixa performance
      document.body.classList.add('low-performance-mode');
      
      // Desativa animações pesadas
      const styles = document.createElement('style');
      styles.textContent = `
        .low-performance-mode * {
          animation-duration: 0.001s !important;
          transition-duration: 0.001s !important;
        }
        .low-performance-mode [data-animate] {
          display: none !important;
        }
      `;
      document.head.appendChild(styles);
    }
    
    monitorNetwork() {
      const originalFetch = window.fetch;
      
      window.fetch = function(...args) {
        const start = performance.now();
        const url = typeof args[0] === 'string' ? args[0] : args[0].url;
        
        return originalFetch.apply(this, args).then(response => {
          const duration = performance.now() - start;
          
          if (duration > this.thresholds.apiCall) {
            Logger.warn('Requisição lenta', {
              url: url,
              duration: Math.round(duration),
              threshold: this.thresholds.apiCall
            });
          }
          
          return response;
        }).catch(error => {
          Logger.error('Falha na requisição', { url, error: error.message });
          throw error;
        });
      }.bind(this);
    }
    
    suggestOptimizations() {
      const suggestions = [];
      
      // Verifica imagens grandes
      document.querySelectorAll('img').forEach(img => {
        if (img.naturalWidth > 2000 || img.naturalHeight > 2000) {
          suggestions.push(`Imagem muito grande: ${img.src.substring(0, 50)}...`);
        }
      });
      
      // Verifica scripts pesados
      document.querySelectorAll('script[src]').forEach(script => {
        const size = parseInt(script.dataset.size) || 0;
        if (size > 500000) { // > 500KB
          suggestions.push(`Script grande: ${script.src.substring(0, 50)}...`);
        }
      });
      
      if (suggestions.length > 0) {
        Logger.warn('Sugestões de otimização:', suggestions);
      }
    }
  }

  // ====================================================
  // 6. SISTEMA DE FALLBACK INTELIGENTE
  // ====================================================
  class SmartFallback {
    constructor() {
      this.fallbackRoutes = new Map();
      this.active = false;
    }
    
    registerFallback(original, fallback) {
      this.fallbackRoutes.set(original, fallback);
    }
    
    activate() {
      if (this.active) return;
      
      this.active = true;
      document.body.classList.add('fallback-active');
      Logger.log('Modo fallback ativado');
      
      // Substitui componentes pesados
      this.replaceHeavyComponents();
      
      // Desativa funcionalidades não essenciais
      this.disableNonEssential();
      
      // Usa localStorage simplificado
      this.simplifyStorage();
    }
    
    replaceHeavyComponents() {
      // Substitui DataTables por tabelas simples
      if (typeof $.fn.DataTable !== 'undefined') {
        document.querySelectorAll('.dataTable').forEach(table => {
          if ($.fn.dataTable.isDataTable(table)) {
            $(table).DataTable().destroy();
            table.classList.remove('dataTable');
          }
        });
      }
      
      // Substitui gráficos complexos
      document.querySelectorAll('canvas').forEach(canvas => {
        if (canvas.id.includes('chart') || canvas.classList.contains('chart')) {
          const parent = canvas.parentNode;
          const simple = document.createElement('div');
          simple.className = 'simple-chart-fallback';
          simple.innerHTML = '<p style="padding: 20px; text-align: center; color: #666;">Gráfico simplificado (modo performance)</p>';
          parent.replaceChild(simple, canvas);
        }
      });
    }
    
    disableNonEssential() {
      // Desativa animações
      document.querySelectorAll('[data-animate], .animate').forEach(el => {
        el.style.animation = 'none';
      });
      
      // Desativa tooltips e popovers
      if (typeof bootstrap !== 'undefined') {
        document.querySelectorAll('[data-bs-toggle="tooltip"], [data-bs-toggle="popover"]').forEach(el => {
          const instance = bootstrap.Tooltip.getInstance(el) || bootstrap.Popover.getInstance(el);
          if (instance) instance.disable();
        });
      }
    }
    
    simplifyStorage() {
      // Fallback para quando localStorage falha
      const memoryStorage = {};
      
      Object.defineProperty(window, 'localStorage', {
        get: function() {
          return {
            getItem: (key) => memoryStorage[key] || null,
            setItem: (key, value) => { memoryStorage[key] = value; },
            removeItem: (key) => delete memoryStorage[key],
            clear: () => { Object.keys(memoryStorage).forEach(k => delete memoryStorage[k]); },
            key: (index) => Object.keys(memoryStorage)[index] || null,
            length: Object.keys(memoryStorage).length
          };
        }
      });
    }
  }

  // ====================================================
  // 7. HEALTH CHECK AUTOMÁTICO
  // ====================================================
  class HealthCheckSystem {
    constructor() {
      this.checks = [];
      this.lastStatus = 'unknown';
      this.init();
    }
    
    init() {
      // Check básico de funcionalidades
      this.registerCheck('javascript', () => typeof window !== 'undefined');
      this.registerCheck('dom', () => typeof document !== 'undefined');
      this.registerCheck('fetch', () => typeof fetch === 'function');
      this.registerCheck('promise', () => typeof Promise === 'function');
      this.registerCheck('localStorage', () => {
        try {
          localStorage.setItem('test', 'test');
          localStorage.removeItem('test');
          return true;
        } catch (e) {
          return false;
        }
      });
      
      // Check periódico
      setInterval(() => this.runChecks(), CONFIG.healthCheckInterval);
      
      // Check inicial
      setTimeout(() => this.runChecks(), 5000);
    }
    
    registerCheck(name, checkFn) {
      this.checks.push({ name, checkFn });
    }
    
    async runChecks() {
      const results = [];
      
      for (const check of this.checks) {
        try {
          const passed = await Promise.resolve(check.checkFn());
          results.push({ name: check.name, passed });
          
          if (!passed) {
            Logger.warn(`Health check falhou: ${check.name}`);
          }
        } catch (error) {
          results.push({ name: check.name, passed: false, error: error.message });
          Logger.error(`Erro no health check ${check.name}:`, error);
        }
      }
      
      const allPassed = results.every(r => r.passed);
      this.lastStatus = allPassed ? 'healthy' : 'degraded';
      
      if (!allPassed) {
        this.handleDegradedState(results.filter(r => !r.passed));
      }
      
      return results;
    }
    
    handleDegradedState(failedChecks) {
      Logger.warn('Sistema degradado', { failedChecks });
      
      // Ações específicas baseadas no que falhou
      failedChecks.forEach(check => {
        switch (check.name) {
          case 'localStorage':
            Logger.log('Usando fallback para localStorage');
            break;
          case 'fetch':
            Logger.log('Usando XHR como fallback para fetch');
            break;
        }
      });
    }
    
    getStatus() {
      return {
        status: this.lastStatus,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      };
    }
  }

  // ====================================================
  // 8. CARREGAMENTO SEGURO DE SCRIPTS
  // ====================================================
  class ScriptLoader {
    constructor() {
      this.queue = [];
      this.loading = new Set();
      this.loaded = new Set();
      this.failed = new Set();
    }
    
    loadScript(url, options = {}) {
      return new Promise((resolve, reject) => {
        if (this.loaded.has(url)) {
          resolve();
          return;
        }
        
        if (this.loading.has(url)) {
          // Já está carregando, espera
          const checkInterval = setInterval(() => {
            if (this.loaded.has(url)) {
              clearInterval(checkInterval);
              resolve();
            } else if (this.failed.has(url)) {
              clearInterval(checkInterval);
              reject(new Error(`Script já falhou: ${url}`));
            }
          }, 100);
          return;
        }
        
        this.loading.add(url);
        
        const script = document.createElement('script');
        script.src = url;
        
        if (options.defer) script.defer = true;
        if (options.async) script.async = true;
        if (options.crossOrigin) script.crossOrigin = options.crossOrigin;
        if (options.integrity) script.integrity = options.integrity;
        
        script.onload = () => {
          this.loading.delete(url);
          this.loaded.add(url);
          Logger.log(`Script carregado: ${url}`);
          resolve();
        };
        
        script.onerror = (error) => {
          this.loading.delete(url);
          this.failed.add(url);
          Logger.error(`Falha ao carregar script: ${url}`, error);
          
          if (options.fallback) {
            Logger.log(`Tentando fallback para: ${url}`);
            this.loadScript(options.fallback).then(resolve).catch(reject);
          } else {
            reject(new Error(`Falha ao carregar script: ${url}`));
          }
        };
        
        // Adiciona ao DOM
        if (options.position === 'head') {
          document.head.appendChild(script);
        } else {
          document.body.appendChild(script);
        }
      });
    }
    
    loadStylesheet(url, options = {}) {
      return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = url;
        
        if (options.integrity) link.integrity = options.integrity;
        if (options.crossOrigin) link.crossOrigin = options.crossOrigin;
        
        link.onload = () => {
          Logger.log(`Stylesheet carregado: ${url}`);
          resolve();
        };
        
        link.onerror = (error) => {
          Logger.error(`Falha ao carregar stylesheet: ${url}`, error);
          
          if (options.fallback) {
            this.loadStylesheet(options.fallback, options).then(resolve).catch(reject);
          } else {
            reject(new Error(`Falha ao carregar stylesheet: ${url}`));
          }
        };
        
        document.head.appendChild(link);
      });
    }
  }

  // ====================================================
  // 9. INICIALIZAÇÃO DO SISTEMA
  // ====================================================
  function initializeResilienceSystem() {
    Logger.log('Inicializando sistema de resiliência...');
    
    // Cria instâncias
    const dependencyMonitor = new DependencyMonitor();
    const errorHandler = new GlobalErrorHandler();
    const performanceGuard = new PerformanceGuard();
    const smartFallback = new SmartFallback();
    const healthCheck = new HealthCheckSystem();
    const scriptLoader = new ScriptLoader();
    
    // Registra dependências críticas
    dependencyMonitor.register('bootstrap', () => typeof bootstrap !== 'undefined', 
      'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js', true);
    
    dependencyMonitor.register('jquery', () => typeof $ !== 'undefined',
      'https://code.jquery.com/jquery-3.7.0.min.js', false);
    
    dependencyMonitor.register('feather', () => typeof feather !== 'undefined',
      'https://cdn.jsdelivr.net/npm/feather-icons@4.29.0/dist/feather.min.js', false);
    
    // Verifica dependências
    dependencyMonitor.checkAll();
    
    // Configura fallbacks
    smartFallback.registerFallback('/api/dashboard', '/api/dashboard-simple');
    smartFallback.registerFallback('/api/charts', '/api/charts-simple');
    
    // Expõe para uso global (opcional)
    window.Resilience = {
      Logger,
      dependencyMonitor,
      errorHandler,
      performanceGuard,
      smartFallback,
      healthCheck,
      scriptLoader,
      CONFIG,
      
      // Métodos úteis
      safeExecute: (fn, context = 'anonymous') => {
        try {
          return fn();
        } catch (error) {
          errorHandler.handleError(error, { context });
          return null;
        }
      },
      
      retry: async (fn, maxAttempts = 3, delay = 1000) => {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          try {
            return await fn();
          } catch (error) {
            if (attempt === maxAttempts) throw error;
            await new Promise(r => setTimeout(r, delay * attempt));
          }
        }
      },
      
      getDiagnostics: () => {
        return {
          errors: Array.from(errorHandler.handledErrors),
          dependencies: dependencyMonitor.checkAll(),
          performance: performanceGuard.metrics,
          health: healthCheck.getStatus(),
          memory: performance.memory ? {
            usedMB: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
            totalMB: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
            percent: Math.round((performance.memory.usedJSHeapSize / performance.memory.totalJSHeapSize) * 100)
          } : null
        };
      }
    };
    
    Logger.log('Sistema de resiliência inicializado com sucesso');
    
    // Adiciona estilos para notificações
    addResilienceStyles();
  }

  // ====================================================
  // 10. ESTILOS DO SISTEMA
  // ====================================================
  function addResilienceStyles() {
    const styles = document.createElement('style');
    styles.textContent = `
      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      
      .fallback-mode * {
        animation: none !important;
        transition: none !important;
      }
      
      .low-performance-mode {
        image-rendering: optimizeSpeed;
        -webkit-image-rendering: optimizeSpeed;
      }
      
      .simple-chart-fallback {
        background: #f8f9fa;
        border: 1px solid #dee2e6;
        border-radius: 4px;
        margin: 10px 0;
      }
      
      /* Overlay de loading */
      .resilience-loading {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999;
        backdrop-filter: blur(5px);
      }
      
      .resilience-loading-content {
        text-align: center;
        padding: 30px;
        background: white;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      }
    `;
    document.head.appendChild(styles);
  }

  // ====================================================
  // 11. INICIALIZAÇÃO AUTOMÁTICA
  // ====================================================
  // Inicializa quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeResilienceSystem);
  } else {
    initializeResilienceSystem();
  }

  // ====================================================
  // 12. POLYFILLS ESSENCIAIS (para navegadores antigos)
  // ====================================================
  // Promise.finally polyfill
  if (!Promise.prototype.finally) {
    Promise.prototype.finally = function(callback) {
      const P = this.constructor;
      return this.then(
        value => P.resolve(callback()).then(() => value),
        reason => P.resolve(callback()).then(() => { throw reason; })
      );
    };
  }

  // Object.entries polyfill
  if (!Object.entries) {
    Object.entries = function(obj) {
      const ownProps = Object.keys(obj);
      let i = ownProps.length;
      const resArray = new Array(i);
      while (i--) {
        resArray[i] = [ownProps[i], obj[ownProps[i]]];
      }
      return resArray;
    };
  }

  // Fetch polyfill básico (fallback para navegadores muito antigos)
  if (!window.fetch && window.XMLHttpRequest) {
    window.fetch = function(url, options = {}) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(options.method || 'GET', url);
        
        if (options.headers) {
          Object.keys(options.headers).forEach(key => {
            xhr.setRequestHeader(key, options.headers[key]);
          });
        }
        
        xhr.onload = function() {
          resolve(new Response(xhr.responseText, {
            status: xhr.status,
            statusText: xhr.statusText,
            headers: new Headers(xhr.getAllResponseHeaders())
          }));
        };
        
        xhr.onerror = reject;
        xhr.send(options.body);
      });
    };
  }

})();

// ====================================================
// 13. UTILITÁRIOS GLOBAIS ADICIONAIS
// ====================================================

/**
 * Função segura para executar código com timeout
 */
window.runSafe = function(fn, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Timeout excedido'));
    }, timeout);
    
    try {
      const result = fn();
      clearTimeout(timeoutId);
      
      if (result instanceof Promise) {
        result.then(resolve).catch(reject);
      } else {
        resolve(result);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      reject(error);
    }
  });
};

/**
 * Verifica se um elemento existe antes de manipular
 */
window.safeQuery = function(selector, callback) {
  const element = document.querySelector(selector);
  if (element && callback) {
    try {
      callback(element);
    } catch (error) {
      console.warn(`Erro em safeQuery para ${selector}:`, error);
    }
  }
  return element;
};

/**
 * Carrega um módulo com fallback
 */
window.loadModule = function(moduleName, primaryUrl, fallbackUrl) {
  return new Promise((resolve) => {
    if (window[moduleName]) {
      resolve(window[moduleName]);
      return;
    }
    
    const script = document.createElement('script');
    script.src = primaryUrl;
    
    script.onload = () => resolve(window[moduleName]);
    script.onerror = () => {
      if (fallbackUrl) {
        const fallbackScript = document.createElement('script');
        fallbackScript.src = fallbackUrl;
        fallbackScript.onload = () => resolve(window[moduleName]);
        fallbackScript.onerror = () => resolve(null);
        document.head.appendChild(fallbackScript);
      } else {
        resolve(null);
      }
    };
    
    document.head.appendChild(script);
  });
};

/**
 * Debug helper (apenas em desenvolvimento)
 */
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  window.debugResilience = function() {
    if (window.Resilience) {
      console.log('🔧 Diagnóstico completo:', window.Resilience.getDiagnostics());
    } else {
      console.warn('Sistema de resiliência não inicializado');
    }
  };
}