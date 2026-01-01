// health-check.js
class JSHealthChecker {
    constructor() {
        this.errors = [];
        this.checks = [];
        this.initialized = false;
    }

    init() {
        // Monitora erros globais
        window.addEventListener('error', (event) => {
            this.logError('Erro global', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error
            });
        });

        // Monitora promessas não tratadas
        window.addEventListener('unhandledrejection', (event) => {
            this.logError('Promise rejeitada', {
                reason: event.reason
            });
        });

        // Verifica APIs essenciais
        this.checkEssentialAPIs();
        
        this.initialized = true;
        console.log('Health Checker inicializado');
    }

    logError(context, errorData) {
        const error = {
            timestamp: new Date().toISOString(),
            context,
            ...errorData
        };
        
        this.errors.push(error);
        
        // Envia para um serviço de logging (opcional)
        this.reportToServer(error);
        
        // Mostra feedback amigável ao usuário
        this.showUserFriendlyError();
        
        console.error('Erro detectado:', error);
    }

    checkEssentialAPIs() {
        const essentialAPIs = [
            'fetch',
            'localStorage',
            'sessionStorage',
            'JSON',
            'console'
        ];

        essentialAPIs.forEach(api => {
            if (!window[api]) {
                this.logError(`API ${api} não disponível`, { api });
            }
        });
    }

    addCustomCheck(name, checkFunction) {
        try {
            const result = checkFunction();
            this.checks.push({
                name,
                status: 'passed',
                result
            });
        } catch (error) {
            this.logError(`Check ${name} falhou`, { error });
            this.checks.push({
                name,
                status: 'failed',
                error
            });
        }
    }

    showUserFriendlyError() {
        // Remove notificações antigas
        const oldNotification = document.querySelector('.js-error-notification');
        if (oldNotification) oldNotification.remove();

        // Cria nova notificação
        const notification = document.createElement('div');
        notification.className = 'js-error-notification';
        notification.innerHTML = `
            <div style="
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #ff4757;
                color: white;
                padding: 15px;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                z-index: 10000;
                max-width: 300px;
                animation: slideIn 0.3s ease;
            ">
                <strong>⚠️ Problema Técnico</strong>
                <p>Algumas funcionalidades podem não estar funcionando corretamente.</p>
                <button onclick="this.parentElement.remove()" style="
                    background: white;
                    color: #ff4757;
                    border: none;
                    padding: 5px 10px;
                    border-radius: 4px;
                    cursor: pointer;
                    margin-top: 10px;
                ">Fechar</button>
                <button onclick="window.location.reload()" style="
                    background: #3742fa;
                    color: white;
                    border: none;
                    padding: 5px 10px;
                    border-radius: 4px;
                    cursor: pointer;
                    margin-top: 10px;
                    margin-left: 5px;
                ">Recarregar</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Remove automaticamente após 10 segundos
        setTimeout(() => notification.remove(), 10000);
    }

    reportToServer(error) {
        // Envia erro para seu servidor/logging service
        if (navigator.onLine) {
            fetch('/api/log-error', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(error)
            }).catch(() => {
                // Falha silenciosa se não conseguir enviar
            });
        }
    }

    getHealthReport() {
        return {
            timestamp: new Date().toISOString(),
            healthy: this.errors.length === 0,
            totalErrors: this.errors.length,
            lastError: this.errors[this.errors.length - 1],
            checks: this.checks,
            userAgent: navigator.userAgent,
            online: navigator.onLine
        };
    }
}

// Inicializa o health checker
const healthChecker = new JSHealthChecker();
window.addEventListener('DOMContentLoaded', () => {
    healthChecker.init();
});

// Exemplo de uso: Adicionar checks customizados
healthChecker.addCustomCheck('Dashboard API', () => {
    // Verifica se a API do dashboard está acessível
    return fetch('/api/dashboard/health').then(r => r.ok);
});

healthChecker.addCustomCheck('Local Storage', () => {
    // Verifica se localStorage funciona
    const testKey = 'health_test';
    localStorage.setItem(testKey, 'test');
    const value = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);
    return value === 'test';
});