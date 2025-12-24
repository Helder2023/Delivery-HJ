(function () {
    'use strict';

    // 🧭 Define a pasta raiz onde as páginas podem ser navegadas
    const BASE_PATH = '../sessao-admin/paginas/';

    const routes = {
        '/': { title: 'Home', file: BASE_PATH + 'home.html' },
        '/perfil': { title: 'Perfil', file: BASE_PATH + 'perfil.html' },
        '/contact': { title: 'Contato', file: BASE_PATH + 'contact.html' },
        '/404': { title: 'Erro 404', file: BASE_PATH + '404.html' }
    };

    const app = document.getElementById('app');
    if (!app) {
        console.error('router-hash: não encontrou <main id="app">.');
        return;
    }

    async function loadFile(filePath, titleHint) {
        app.innerHTML = `<div class="loading">Carregando...</div>`;
        const attempts = [filePath];
        let html = null;

        for (const attempt of attempts) {
            try {
                const res = await fetch(attempt, { cache: 'no-store' });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                html = await res.text();
                break;
            } catch (err) {}
        }

        // ❌ Se o arquivo não for encontrado, carrega a página 404
        if (!html) {
            console.warn('Página não encontrada. Mostrando erro 404...');
            return await loadFile(BASE_PATH + '404.html', 'Erro 404');
        }

        const tmp = document.createElement('div');
        tmp.innerHTML = html;

        const scripts = Array.from(tmp.querySelectorAll('script'));
        scripts.forEach(s => s.remove());

        app.innerHTML = tmp.innerHTML;

        // Reexecuta scripts internos
        for (const s of scripts) {
            const newScript = document.createElement('script');
            if (s.src) newScript.src = s.src;
            else newScript.textContent = s.textContent;
            document.body.appendChild(newScript);
        }

        if (window.feather) feather.replace();
        initDataTablesFilters();
        await loadPageScript();

        document.title = `DeliveryHJ | ${titleHint || 'Página'}`;
        updateActiveLinks(filePath);
    }

    function updateActiveLinks(currentFileNormalized) {
        const anchors = Array.from(document.querySelectorAll('a'));
        anchors.forEach(a => {
            const href = a.getAttribute('href') || '';
            const li = a.closest('.sidebar-item');
            if (href.startsWith('#/')) {
                const key = href.slice(2);
                const route = routes['/' + key];
                if (route && route.file === currentFileNormalized) {
                    a.classList.add('active');
                    if (li) li.classList.add('active');
                } else {
                    a.classList.remove('active');
                    if (li) li.classList.remove('active');
                }
            }
        });
    }

    function initDataTablesFilters() {
        if (typeof $ === 'undefined' || !$.fn.DataTable) return;
        // ... (mantém o mesmo código original aqui)
    }

    async function loadHash() {
        let hash = location.hash || '#/';
        let token = hash.startsWith('#/') ? hash.slice(2) : hash.replace('#', '');
        if (token === '') token = '/';

        // 🚫 Bloqueia navegação fora da pasta base
        if (token.includes('..') || token.includes('://')) {
            console.warn('Navegação fora da pasta base não é permitida.');
            return await loadFile(BASE_PATH + '404.html', 'Erro 404');
        }

        // Se o token terminar com "/" → redireciona para home.html da pasta
        if (token.endsWith('/')) {
            location.hash = '#/';
            return await loadFile(BASE_PATH + 'home.html', 'Home');
        }

        const route = routes['/' + token];
        if (route) return await loadFile(route.file, route.title);

        // Se for um arquivo direto dentro da pasta base
        const filePath = BASE_PATH + token + '.html';
        try {
            const res = await fetch(filePath, { cache: 'no-store' });
            if (res.ok) return await loadFile(filePath, token);
        } catch (err) {}

        // ❌ Página não encontrada
        return await loadFile(BASE_PATH + '404.html', 'Erro 404');
    }

    document.addEventListener('click', function (ev) {
        const a = ev.target.closest('a');
        if (!a) return;
        const href = a.getAttribute('href') || '';

        if (href.startsWith('#/')) {
            ev.preventDefault();
            location.hash = href;
            loadHash();
        }
    });

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
            console.error('Erro ao carregar page.js:', err);
        }
    }

    window.addEventListener('hashchange', loadHash);
    document.addEventListener('DOMContentLoaded', () => {
        if (location.hash) loadHash();
        else {
            location.hash = '#/';
            loadHash();
        }
    });
})();
