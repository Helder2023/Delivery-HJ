// dependency-checker.js
class DependencyChecker {
    constructor(dependencies) {
        this.dependencies = dependencies || {};
    }

    checkAll() {
        const results = {};
        
        for (const [name, check] of Object.entries(this.dependencies)) {
            try {
                results[name] = {
                    available: check(),
                    timestamp: new Date().toISOString()
                };
            } catch (error) {
                results[name] = {
                    available: false,
                    error: error.message,
                    timestamp: new Date().toISOString()
                };
            }
        }
        
        return results;
    }

    ensureDependencies() {
        const results = this.checkAll();
        const missing = Object.entries(results)
            .filter(([_, result]) => !result.available)
            .map(([name]) => name);

        if (missing.length > 0) {
            console.warn('Dependências faltando:', missing);
            this.loadFallbacks(missing);
            return false;
        }
        
        return true;
    }

    loadFallbacks(missingDeps) {
        const fallbacks = {
            'chart.js': 'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js',
            'moment': 'https://cdn.jsdelivr.net/npm/moment@2.29.4/min/moment.min.js'
            // Adicione outras dependências
        };

        missingDeps.forEach(dep => {
            if (fallbacks[dep]) {
                this.loadScript(fallbacks[dep]);
            }
        });
    }

    loadScript(url) {
        const script = document.createElement('script');
        script.src = url;
        script.onload = () => console.log(`Fallback carregado: ${url}`);
        document.head.appendChild(script);
    }
}

// Configuração das dependências do dashboard
const dashboardDeps = {
    'fetch': () => typeof fetch === 'function',
    'Promise': () => typeof Promise === 'function',
    'localStorage': () => {
        try {
            return 'localStorage' in window && window.localStorage !== null;
        } catch (e) {
            return false;
        }
    },
    'Chart': () => typeof Chart === 'function',
    'moment': () => typeof moment === 'function'
};

const depsChecker = new DependencyChecker(dashboardDeps);
depsChecker.ensureDependencies();