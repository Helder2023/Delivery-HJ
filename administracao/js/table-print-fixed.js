// ===========================================
// TABLE EXPORT - PDF e Excel apenas
// ===========================================

(function() {
    'use strict';
    
    console.log('📊 Sistema de Exportação (PDF+Excel) carregado');
    
    // Configurações
    const CONFIG = {
        delay: 1000,
        maxRetries: 8
    };
    
    let initialized = false;
    
    // ============================
    // INICIALIZAÇÃO PRINCIPAL
    // ============================
    
    function initExportSystem() {
        if (initialized) return;
        
        console.log('🔄 Inicializando sistema...');
        
        // Carrega jsPDF primeiro
        loadJsPDF().then(() => {
            // Verifica se já temos DataTables
            if (typeof $.fn.DataTable !== 'undefined') {
                setTimeout(addExportButtons, CONFIG.delay);
            } else {
                // Tenta detectar DataTables
                let attempts = 0;
                const checkInterval = setInterval(() => {
                    attempts++;
                    if (typeof $.fn.DataTable !== 'undefined') {
                        clearInterval(checkInterval);
                        setTimeout(addExportButtons, CONFIG.delay);
                    } else if (attempts >= CONFIG.maxRetries) {
                        clearInterval(checkInterval);
                        console.warn('DataTables não encontrado, usando fallback');
                        addExportButtonsFallback();
                    }
                }, 500);
            }
            
            initialized = true;
            setupEventListeners();
        });
    }
    
    // ============================
    // ADICIONAR BOTÕES
    // ============================
    
    function addExportButtons() {
        console.log('➕ Adicionando botões de exportação...');
        
        // 1. Tabelas DataTables
        const dataTables = document.querySelectorAll('table.dataTable');
        dataTables.forEach(table => {
            if (!hasExportButtons(table)) {
                addExportButtonGroup(table, 'datatable');
            }
        });
        
        // 2. Tabelas com IDs específicos
        const specificTables = document.querySelectorAll('table[id*="tabela"], table[id*="example"]');
        specificTables.forEach(table => {
            if (!table.classList.contains('dataTable') && !hasExportButtons(table)) {
                addExportButtonGroup(table, 'generic');
            }
        });
        
        console.log(`✅ ${dataTables.length + specificTables.length} tabelas processadas`);
    }
    
    function addExportButtonsFallback() {
        // Para tabelas sem DataTables
        const tables = document.querySelectorAll('table');
        tables.forEach(table => {
            if (table.offsetWidth > 300 && !hasExportButtons(table)) {
                addExportButtonGroup(table, 'generic');
            }
        });
    }
    
    function hasExportButtons(table) {
        const tableId = table.id || '';
        return document.getElementById(`export-group-${tableId}`) !== null;
    }
    
    function addExportButtonGroup(table, type) {
        try {
            const tableId = ensureTableId(table);
            const container = findButtonContainer(table, type);
            
            if (!container) {
                console.warn('Container não encontrado para:', tableId);
                return;
            }
            
            const buttonGroup = createButtonGroup(tableId);
            container.appendChild(buttonGroup);
            
            console.log(`✅ Botões adicionados: ${tableId}`);
            
        } catch (error) {
            console.error('Erro ao adicionar botões:', error);
        }
    }
    
    function findButtonContainer(table, type) {
        if (type === 'datatable') {
            const wrapper = table.closest('.dataTables_wrapper');
            if (wrapper) {
                // Tenta colocar ao lado dos botões existentes
                const dtButtons = wrapper.querySelector('.dt-buttons');
                if (dtButtons) return dtButtons;
                
                // Ou cria um novo container
                const colMd6 = wrapper.querySelector('.col-md-6');
                if (colMd6) {
                    const container = document.createElement('div');
                    container.className = 'table-export-container';
                    container.style.display = 'inline-block';
                    colMd6.appendChild(container);
                    return container;
                }
                
                // Ou usa o wrapper
                return wrapper;
            }
        }
        
        // Para tabelas genéricas, coloca antes da tabela
        const container = document.createElement('div');
        container.className = 'table-export-header';
        container.style.marginBottom = '15px';
        container.style.display = 'flex';
        container.style.gap = '10px';
        container.style.flexWrap = 'wrap';
        table.parentNode.insertBefore(container, table);
        return container;
    }
    
    function createButtonGroup(tableId) {
        const group = document.createElement('div');
        group.id = `export-group-${tableId}`;
        group.className = 'table-export-buttons';
        
        // Botões: apenas PDF e Excel
        group.appendChild(createButton(tableId, 'pdf', 'PDF', 'file-pdf'));
        group.appendChild(createButton(tableId, 'excel', 'Excel', 'file-excel'));
        
        return group;
    }
    
    function createButton(tableId, type, text, icon) {
        const button = document.createElement('button');
        button.id = `${type}-${tableId}`;
        button.className = `export-btn btn-${type}`;
        button.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span class="btn-text">${text}</span>
            <span class="loading"></span>
        `;
        button.dataset.tableId = tableId;
        button.dataset.action = type;
        
        button.addEventListener('click', handleExportClick);
        
        return button;
    }
    
    // ============================
    // MANIPULAÇÃO DE CLICK
    // ============================
    
    function handleExportClick(event) {
        event.preventDefault();
        event.stopPropagation();
        
        const button = event.currentTarget;
        const tableId = button.dataset.tableId;
        const action = button.dataset.action;
        const table = document.getElementById(tableId);
        
        if (!table) {
            alert('Tabela não encontrada!');
            return;
        }
        
        // Mostra loading
        button.classList.add('loading');
        button.disabled = true;
        
        // Executa ação
        setTimeout(() => {
            try {
                switch(action) {
                    case 'pdf':
                        exportToPDF(table);
                        break;
                    case 'excel':
                        exportToExcel(table);
                        break;
                }
            } catch (error) {
                console.error('Erro na exportação:', error);
                alert('Erro ao exportar: ' + error.message);
            } finally {
                // Remove loading
                setTimeout(() => {
                    button.classList.remove('loading');
                    button.disabled = false;
                }, 500);
            }
        }, 300);
    }
    
    // ============================
    // FUNÇÃO PDF
    // ============================
    
    function exportToPDF(table) {
        console.log('📄 Gerando PDF para:', table.id);
        
        // Verifica se jsPDF está disponível
        if (typeof window.jspdf === 'undefined') {
            alert('Biblioteca PDF não carregada. Recarregue a página.');
            return;
        }
        
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('p', 'mm', 'a4');
            
            // Configurações
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 15;
            let currentY = margin;
            
            // Título
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text('Relatório - DeliveryHJ', pageWidth / 2, currentY, { align: 'center' });
            currentY += 10;
            
            // Informações
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            doc.text(`Tabela: ${table.id}`, margin, currentY);
            doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth - margin, currentY, { align: 'right' });
            currentY += 10;
            
            // Linha separadora
            doc.setDrawColor(200, 200, 200);
            doc.line(margin, currentY, pageWidth - margin, currentY);
            currentY += 5;
            
            // Extrai dados da tabela
            const tableData = extractTableData(table);
            
            if (tableData.headers.length === 0 || tableData.rows.length === 0) {
                doc.text('Nenhum dado encontrado na tabela', margin, currentY);
                currentY += 10;
            } else {
                // Configura a tabela
                const columns = tableData.headers.map(header => ({ 
                    header, 
                    dataKey: header 
                }));
                
                const rows = tableData.rows.map(row => {
                    const obj = {};
                    tableData.headers.forEach((header, index) => {
                        obj[header] = row[index] || '';
                    });
                    return obj;
                });
                
                // Adiciona tabela
                doc.autoTable({
                    startY: currentY,
                    head: [tableData.headers],
                    body: tableData.rows,
                    margin: { left: margin, right: margin },
                    styles: {
                        fontSize: 9,
                        cellPadding: 3,
                        overflow: 'linebreak',
                        cellWidth: 'wrap'
                    },
                    headStyles: {
                        fillColor: [41, 128, 185],
                        textColor: 255,
                        fontStyle: 'bold',
                        halign: 'center'
                    },
                    bodyStyles: {
                        halign: 'left'
                    },
                    alternateRowStyles: {
                        fillColor: [245, 245, 245]
                    },
                    columnStyles: {}
                });
                
                currentY = doc.lastAutoTable.finalY + 5;
            }
            
            // Rodapé
            doc.setFontSize(10);
            doc.setTextColor(150, 150, 150);
            doc.text('DeliveryHJ Admin Dashboard', pageWidth / 2, pageHeight - 10, { align: 'center' });
            
            // Número da página
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.text(`Página ${i} de ${pageCount}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
            }
            
            // Salva o PDF
            const fileName = `${table.id}_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);
            
            console.log('✅ PDF gerado:', fileName);
            
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            alert('Erro ao gerar PDF. Verifique o console para detalhes.');
            
            // Fallback: tenta método simples
            exportToPDFFallback(table);
        }
    }
    
    function exportToPDFFallback(table) {
        // Método alternativo simples
        const printWindow = window.open('', '_blank');
        const tableClone = table.cloneNode(true);
        
        // Limpa a tabela
        cleanTableForExport(tableClone);
        
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Exportar ${table.id}</title>
                <style>
                    body { font-family: Arial; margin: 20px; }
                    h2 { color: #333; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #ddd; padding: 8px; }
                    th { background: #f5f5f5; }
                </style>
            </head>
            <body>
                <h2>${document.title || 'Relatório'}</h2>
                <p>Exportado em: ${new Date().toLocaleString('pt-BR')}</p>
                ${tableClone.outerHTML}
                <script>
                    window.onload = () => {
                        window.print();
                        // O usuário pode escolher "Salvar como PDF" na impressão
                    };
                <\/script>
            </body>
            </html>
        `;
        
        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();
    }
    
    // ============================
    // FUNÇÃO EXCEL
    // ============================
    
    function exportToExcel(table) {
        console.log('📗 Gerando Excel para:', table.id);
        
        const tableData = extractTableData(table);
        
        if (tableData.headers.length === 0 || tableData.rows.length === 0) {
            alert('Nenhum dado encontrado para exportar.');
            return;
        }
        
        // Cria conteúdo CSV
        let csvContent = '';
        
        // Adiciona BOM para UTF-8
        csvContent = '\ufeff';
        
        // Cabeçalhos
        csvContent += tableData.headers.join(';') + '\r\n';
        
        // Dados
        tableData.rows.forEach(row => {
            // Processa cada célula
            const processedRow = row.map(cell => {
                // Escapa ponto-e-vírgula e aspas
                let text = String(cell || '');
                if (text.includes(';') || text.includes('"') || text.includes('\n') || text.includes('\r')) {
                    text = '"' + text.replace(/"/g, '""') + '"';
                }
                return text;
            });
            
            csvContent += processedRow.join(';') + '\r\n';
        });
        
        // Cria blob
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        // Cria link de download
        const link = document.createElement('a');
        link.href = url;
        link.download = `${table.id}_${new Date().toISOString().split('T')[0]}.csv`;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        
        // Limpa
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 100);
        
        console.log('✅ Excel (CSV) gerado para:', table.id);
    }
    
    // ============================
    // FUNÇÕES UTILITÁRIAS
    // ============================
    
    function extractTableData(table) {
        const headers = [];
        const rows = [];
        
        // Extrai cabeçalhos do thead
        const thead = table.querySelector('thead');
        if (thead) {
            const thElements = thead.querySelectorAll('th');
            thElements.forEach(th => {
                let text = th.textContent.trim();
                
                // Limpa texto
                text = text.replace(/\s+/g, ' ').replace(/\n/g, ' ').replace(/\r/g, ' ');
                
                // Ignora colunas de ação
                const lowerText = text.toLowerCase();
                if (text && !lowerText.includes('ação') && !lowerText.includes('opção') && 
                    !lowerText.includes('acoes') && !lowerText.includes('opcoes')) {
                    headers.push(text);
                }
            });
        }
        
        // Se não tem cabeçalhos, usa padrão
        if (headers.length === 0) {
            const firstRow = table.querySelector('tbody tr');
            if (firstRow) {
                const cells = firstRow.querySelectorAll('td');
                cells.forEach((_, i) => headers.push(`Coluna ${i + 1}`));
            }
        }
        
        // Extrai dados do tbody
        const tbody = table.querySelector('tbody');
        if (tbody) {
            const trElements = tbody.querySelectorAll('tr');
            trElements.forEach(tr => {
                const row = [];
                const cells = tr.querySelectorAll('td');
                
                cells.forEach((cell, index) => {
                    if (index < headers.length) {
                        // Clona a célula para não afetar o original
                        const cellClone = cell.cloneNode(true);
                        
                        // Remove elementos indesejados
                        cellClone.querySelectorAll('button, .btn, .actions, .fa, [onclick]').forEach(el => el.remove());
                        
                        // Extrai texto
                        let text = cellClone.textContent.trim();
                        text = text.replace(/\s+/g, ' ').replace(/\n/g, ' ').replace(/\r/g, ' ');
                        
                        // Formata números
                        const cleanText = text.replace(/[^0-9.,-]/g, '');
                        if (/^-?\d+([.,]\d+)?$/.test(cleanText)) {
                            const num = parseFloat(cleanText.replace(/\./g, '').replace(',', '.'));
                            if (!isNaN(num)) {
                                text = num.toLocaleString('pt-BR', {
                                    minimumFractionDigits: cleanText.includes(',') ? 2 : 0,
                                    maximumFractionDigits: 2
                                });
                            }
                        }
                        
                        row.push(text || '');
                    }
                });
                
                if (row.length > 0 && row.some(cell => cell.trim() !== '')) {
                    rows.push(row);
                }
            });
        }
        
        return { headers, rows };
    }
    
    function cleanTableForExport(table) {
        // Remove elementos indesejados
        const elementsToRemove = table.querySelectorAll(
            '.table-export-buttons, .export-btn, .no-print, ' +
            '.dt-buttons, .dataTables_filter, .dataTables_length, ' +
            '.dataTables_info, .dataTables_paginate, button, ' +
            '.btn, [class*="action"], .actions, .fa, .fas'
        );
        
        elementsToRemove.forEach(el => el.remove());
    }
    
    function ensureTableId(table) {
        if (!table.id) {
            table.id = 'tabela_' + Date.now();
        }
        return table.id;
    }
    
    function setupEventListeners() {
        // Detecta novas tabelas (para SPAs)
        window.addEventListener('hashchange', () => {
            setTimeout(() => {
                if (initialized) {
                    addExportButtons();
                }
            }, 1500);
        });
    }
    
    // ============================
    // CARREGAMENTO DE BIBLIOTECAS
    // ============================
    
    function loadJsPDF() {
        return new Promise((resolve) => {
            if (typeof window.jspdf !== 'undefined') {
                console.log('✅ jsPDF já carregado');
                resolve();
                return;
            }
            
            console.log('📥 Carregando jsPDF...');
            
            // Carrega jsPDF
            const script1 = document.createElement('script');
            script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            
            script1.onload = () => {
                console.log('✅ jsPDF carregado');
                
                // Carrega autoTable
                const script2 = document.createElement('script');
                script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js';
                
                script2.onload = () => {
                    console.log('✅ autoTable carregado');
                    setTimeout(resolve, 500);
                };
                
                script2.onerror = () => {
                    console.warn('⚠️ autoTable não carregado');
                    setTimeout(resolve, 500);
                };
                
                document.head.appendChild(script2);
            };
            
            script1.onerror = () => {
                console.warn('⚠️ jsPDF não carregado');
                setTimeout(resolve, 500);
            };
            
            document.head.appendChild(script1);
        });
    }
    
    // ============================
    // INICIALIZAÇÃO
    // ============================
    
    // Inicia quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(initExportSystem, 500);
        });
    } else {
        setTimeout(initExportSystem, 500);
    }
    
    // API pública
    window.TableExport = {
        init: initExportSystem,
        addButtons: (tableId) => {
            const table = document.getElementById(tableId);
            if (table) addExportButtonGroup(table, 'generic');
        },
        exportPDF: (tableId) => {
            const table = document.getElementById(tableId);
            if (table) exportToPDF(table);
        },
        exportExcel: (tableId) => {
            const table = document.getElementById(tableId);
            if (table) exportToExcel(table);
        }
    };
    
})();