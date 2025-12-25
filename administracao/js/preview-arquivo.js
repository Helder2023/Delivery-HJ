// FileUploadPreview - Com Preview REAL de PDF e Imagens
class FileUploadPreview {
    constructor() {
        this.allowedTypes = [
            'application/pdf',
            'image/jpeg', 
            'image/png',
            'image/gif',
            'image/webp',
            'image/bmp'
        ];
        
        this.maxSize = 10 * 1024 * 1024; // 10MB
        this.files = [];
        
        console.log('🚀 Iniciando FileUploadPreview...');
        this.init();
    }
    
    init() {
        // Encontra os elementos
        this.fileInput = document.getElementById('fileInput');
        this.previewContainer = document.getElementById('previewContainer');
        this.validationMessage = document.getElementById('validationMessage');
        
        console.log('🔍 Elementos encontrados:', {
            fileInput: !!this.fileInput,
            previewContainer: !!this.previewContainer,
            validationMessage: !!this.validationMessage
        });
        
        if (!this.fileInput || !this.previewContainer) {
            console.error('❌ Elementos essenciais não encontrados!');
            return;
        }
        
        this.setupEventListeners();
        console.log('✅ FileUploadPreview inicializado!');
    }
    
    setupEventListeners() {
        // Evento quando seleciona arquivos
        this.fileInput.addEventListener('change', (e) => {
            console.log('📁 Arquivo(s) selecionado(s):', e.target.files.length);
            this.processFiles(e.target.files);
        });
        
        // Drag and Drop
        this.setupDragAndDrop();
    }
    
    setupDragAndDrop() {
        const uploadArea = document.querySelector('.upload-area');
        if (!uploadArea) return;
        
        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, (e) => {
                e.preventDefault();
                uploadArea.classList.add('drag-over');
            });
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, (e) => {
                e.preventDefault();
                uploadArea.classList.remove('drag-over');
            });
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            const files = e.dataTransfer.files;
            console.log('📂 Arquivos arrastados:', files.length);
            this.processFiles(files);
        });
    }
    
    processFiles(fileList) {
        if (!fileList || fileList.length === 0) return;
        
        const filesArray = Array.from(fileList);
        
        // Limpa mensagens anteriores
        this.clearValidationMessage();
        
        // Processa cada arquivo
        filesArray.forEach(file => {
            if (this.isValidFile(file)) {
                this.createFilePreview(file);
            } else {
                this.showValidationMessage(
                    `"${file.name}" - Tipo não suportado ou muito grande`,
                    'error'
                );
            }
        });
        
        // Limpa o input para permitir novos uploads
        this.fileInput.value = '';
    }
    
    isValidFile(file) {
        // Verifica tipo
        const isValidType = this.allowedTypes.includes(file.type) || 
                           file.name.match(/\.(pdf|jpg|jpeg|png|gif|webp|bmp)$/i);
        
        // Verifica tamanho
        const isValidSize = file.size <= this.maxSize;
        
        return isValidType && isValidSize;
    }
    
    createFilePreview(file) {
        const fileId = 'preview_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const fileWithId = { ...file, id: fileId };
        
        // Adiciona ao array
        this.files.push(fileWithId);
        
        // Cria elemento de preview
        const previewItem = this.createPreviewElement(fileWithId);
        
        // Adiciona ao container
        this.previewContainer.appendChild(previewItem);
        
        // Gera o conteúdo do preview
        this.generatePreviewContent(fileWithId, previewItem);
        
        console.log('✅ Preview criado para:', file.name);
    }
    
    createPreviewElement(file) {
        const previewItem = document.createElement('div');
        previewItem.className = 'preview-item';
        previewItem.dataset.fileId = file.id;
        
        // HTML do preview item
        previewItem.innerHTML = `
            <div class="preview-header">
                <div class="file-info">
                    <div class="file-name" title="${file.name}">${this.truncateFileName(file.name)}</div>
                    <div class="file-size">${this.formatSize(file.size)}</div>
                </div>
                <button class="remove-btn" onclick="window.fileUploader.removePreview('${file.id}')" title="Remover">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="preview-content" id="content-${file.id}">
                <div class="loading">
                    <div class="spinner"></div>
                    <span>Carregando preview...</span>
                </div>
            </div>
        `;
        
        return previewItem;
    }
    
    generatePreviewContent(file, previewItem) {
        const contentDiv = document.getElementById(`content-${file.id}`);
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const dataUrl = e.target.result;
            
            if (file.type.startsWith('image/')) {
                // PREVIEW DE IMAGEM - Mostra a imagem real
                contentDiv.innerHTML = `
                    <div class="image-preview-wrapper">
                        <img src="${dataUrl}" 
                             alt="${file.name}" 
                             class="preview-image"
                             onload="this.parentElement.querySelector('.image-info').textContent = this.naturalWidth + ' × ' + this.naturalHeight + 'px'">
                        <div class="image-info">Carregando...</div>
                    </div>
                `;
                
            } else if (file.type === 'application/pdf') {
                // PREVIEW DE PDF - Mostra as primeiras páginas
                this.generatePDFPreview(file, dataUrl, contentDiv);
            }
        };
        
        reader.onerror = () => {
            contentDiv.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <span>Erro ao carregar arquivo</span>
                </div>
            `;
        };
        
        reader.readAsDataURL(file);
    }
    
    generatePDFPreview(file, dataUrl, container) {
        // Tenta usar PDF.js para mostrar preview das páginas
        if (typeof pdfjsLib !== 'undefined') {
            // Se PDF.js estiver disponível, mostra miniaturas
            this.renderPDFThumbnails(file, container);
        } else {
            // Fallback: mostra ícone do PDF com opção para visualizar
            container.innerHTML = `
                <div class="pdf-preview-fallback">
                    <div class="pdf-icon-large">
                        <i class="fas fa-file-pdf"></i>
                    </div>
                    <div class="pdf-info">
                        <div class="pdf-title">${this.truncateFileName(file.name, 30)}</div>
                        <div class="pdf-details">
                            <span class="pdf-size">${this.formatSize(file.size)}</span>
                        </div>
                        <button class="view-pdf-btn" onclick="window.open('${dataUrl}', '_blank')">
                            <i class="fas fa-external-link-alt"></i> Visualizar PDF
                        </button>
                    </div>
                </div>
            `;
        }
    }
    
    async renderPDFThumbnails(file, container) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const pageCount = Math.min(pdf.numPages, 3); // Mostra no máximo 3 páginas
            
            let thumbnailsHTML = '';
            
            for (let i = 1; i <= pageCount; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 0.3 });
                
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                
                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise;
                
                thumbnailsHTML += `
                    <div class="pdf-thumbnail">
                        <canvas width="${canvas.width}" height="${canvas.height}"></canvas>
                        <div class="page-number">Pág. ${i}</div>
                    </div>
                `;
            }
            
            container.innerHTML = `
                <div class="pdf-preview-thumbnails">
                    <div class="pdf-thumbnails-container">
                        ${thumbnailsHTML}
                    </div>
                    <div class="pdf-preview-info">
                        <span>${pageCount} de ${pdf.numPages} página(s)</span>
                        <button class="view-full-pdf" onclick="window.open(URL.createObjectURL(${JSON.stringify(file)}), '_blank')">
                            Ver PDF completo
                        </button>
                    </div>
                </div>
            `;
            
            // Copia as imagens dos canvases
            const canvases = container.querySelectorAll('canvas');
            const tempCanvases = document.querySelectorAll('.pdf-thumbnail canvas');
            canvases.forEach((canvas, index) => {
                const tempCanvas = tempCanvases[index];
                const ctx = canvas.getContext('2d');
                ctx.drawImage(tempCanvas, 0, 0);
            });
            
        } catch (error) {
            console.error('Erro ao renderizar PDF:', error);
            container.innerHTML = `
                <div class="pdf-preview-fallback">
                    <div class="pdf-icon-large">
                        <i class="fas fa-file-pdf"></i>
                    </div>
                    <div class="pdf-info">
                        <div class="pdf-error">Não foi possível gerar o preview</div>
                        <button class="view-pdf-btn" onclick="window.open(URL.createObjectURL(${JSON.stringify(file)}), '_blank')">
                            Abrir PDF
                        </button>
                    </div>
                </div>
            `;
        }
    }
    
    removePreview(fileId) {
        // Remove do array
        this.files = this.files.filter(f => f.id !== fileId);
        
        // Remove do DOM
        const previewItem = document.querySelector(`.preview-item[data-file-id="${fileId}"]`);
        if (previewItem) {
            previewItem.style.animation = 'fadeOut 0.3s forwards';
            setTimeout(() => previewItem.remove(), 300);
        }
        
        console.log('🗑️ Preview removido:', fileId);
    }
    
    clearPreviews() {
        this.previewContainer.innerHTML = '';
        this.files = [];
        this.clearValidationMessage();
    }
    
    clearValidationMessage() {
        if (this.validationMessage) {
            this.validationMessage.innerHTML = '';
            this.validationMessage.className = 'validation-message';
            this.validationMessage.style.display = 'none';
        }
    }
    
    showValidationMessage(message, type = 'info') {
        if (!this.validationMessage) return;
        
        this.validationMessage.innerHTML = message;
        this.validationMessage.className = `validation-message ${type}`;
        this.validationMessage.style.display = 'block';
        
        if (type === 'success') {
            setTimeout(() => this.clearValidationMessage(), 3000);
        }
    }
    
    truncateFileName(name, maxLength = 25) {
        if (name.length <= maxLength) return name;
        return name.substring(0, maxLength) + '...';
    }
    
    formatSize(bytes) {
        if (bytes < 1024) return bytes + ' Bytes';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
    
    // Método para testar
    testWithSampleImage() {
        // Cria uma imagem de teste
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 150;
        const ctx = canvas.getContext('2d');
        
        // Desenha uma imagem simples
        ctx.fillStyle = '#4a6cf7';
        ctx.fillRect(0, 0, 200, 150);
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText('Preview Test', 40, 80);
        
        canvas.toBlob((blob) => {
            const testFile = new File([blob], 'test-image.png', { type: 'image/png' });
            this.createFilePreview(testFile);
            console.log('✅ Preview de teste adicionado!');
        }, 'image/png');
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM Carregado - Preparando FileUploadPreview...');
    
    // Adiciona CSS necessário
    this.addPreviewStyles();
    
    // Inicializa após um pequeno delay
    setTimeout(() => {
        window.fileUploader = new FileUploadPreview();
        
        // Adiciona link para PDF.js se não estiver carregado
        if (typeof pdfjsLib === 'undefined') {
            console.log('ℹ️ PDF.js não carregado - usando preview básico para PDFs');
        }
        
        console.log('✅ Sistema de preview pronto!');
        console.log('👉 Teste selecionando uma imagem ou PDF');
    }, 100);
});

// Adiciona estilos CSS dinamicamente
function addPreviewStyles() {
    const styles = `
        /* Animações */
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeOut {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(-10px); }
        }
        
        /* Preview Item */
        .preview-item {
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            overflow: hidden;
            margin-bottom: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            animation: fadeIn 0.3s ease;
            transition: all 0.3s ease;
        }
        
        .preview-item:hover {
            box-shadow: 0 4px 12px rgba(0,0,0,0.12);
            transform: translateY(-2px);
        }
        
        /* Header */
        .preview-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 12px;
            background: #f8f9fa;
            border-bottom: 1px solid #e0e0e0;
        }
        
        .file-info {
            flex: 1;
            min-width: 0;
        }
        
        .file-name {
            font-weight: 600;
            font-size: 13px;
            color: #333;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            margin-bottom: 2px;
        }
        
        .file-size {
            font-size: 11px;
            color: #666;
        }
        
        /* Botão de remover */
        .remove-btn {
            background: #ff4757;
            color: white;
            border: none;
            width: 26px;
            height: 26px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            margin-left: 8px;
            transition: all 0.2s ease;
            flex-shrink: 0;
        }
        
        .remove-btn:hover {
            background: #ff3742;
            transform: scale(1.1);
        }
        
        /* Conteúdo do Preview */
        .preview-content {
            min-height: 160px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }
        
        /* Loading */
        .loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
            color: #666;
            font-size: 13px;
        }
        
        .spinner {
            width: 30px;
            height: 30px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #4a6cf7;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        /* Preview de Imagem */
        .image-preview-wrapper {
            width: 100%;
            height: 160px;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f8f9fa;
        }
        
        .preview-image {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
            padding: 10px;
        }
        
        .image-info {
            position: absolute;
            bottom: 8px;
            left: 8px;
            background: rgba(0,0,0,0.7);
            color: white;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 11px;
        }
        
        /* Preview de PDF (Fallback) */
        .pdf-preview-fallback {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 20px;
            width: 100%;
        }
        
        .pdf-icon-large {
            font-size: 48px;
            color: #ff4757;
        }
        
        .pdf-info {
            flex: 1;
        }
        
        .pdf-title {
            font-weight: 600;
            font-size: 14px;
            margin-bottom: 5px;
            color: #333;
        }
        
        .pdf-details {
            font-size: 12px;
            color: #666;
            margin-bottom: 10px;
        }
        
        .view-pdf-btn {
            background: #4a6cf7;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 12px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 5px;
            transition: background 0.2s;
        }
        
        .view-pdf-btn:hover {
            background: #3a5ce5;
        }
        
        /* Preview de PDF com Thumbnails */
        .pdf-preview-thumbnails {
            width: 100%;
            padding: 15px;
        }
        
        .pdf-thumbnails-container {
            display: flex;
            gap: 10px;
            margin-bottom: 10px;
            overflow-x: auto;
            padding-bottom: 5px;
        }
        
        .pdf-thumbnail {
            flex-shrink: 0;
            position: relative;
            border: 1px solid #e0e0e0;
            border-radius: 4px;
            overflow: hidden;
            background: white;
        }
        
        .pdf-thumbnail canvas {
            display: block;
            max-width: 120px;
            height: auto;
        }
        
        .page-number {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(0,0,0,0.7);
            color: white;
            text-align: center;
            font-size: 10px;
            padding: 2px;
        }
        
        .pdf-preview-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            color: #666;
        }
        
        .view-full-pdf {
            background: none;
            border: 1px solid #4a6cf7;
            color: #4a6cf7;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .view-full-pdf:hover {
            background: #4a6cf7;
            color: white;
        }
        
        /* Mensagem de erro */
        .error-message {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            color: #ff4757;
            padding: 20px;
        }
        
        .error-message i {
            font-size: 24px;
        }
        
        /* Mensagens de validação */
        .validation-message {
            margin-top: 10px;
            padding: 10px 12px;
            border-radius: 6px;
            font-size: 13px;
            display: none;
            animation: fadeIn 0.3s ease;
        }
        
        .validation-message.success {
            display: block;
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        
        .validation-message.error {
            display: block;
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        
        .validation-message.info {
            display: block;
            background: #d1ecf1;
            color: #0c5460;
            border: 1px solid #bee5eb;
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}

// Adiciona Font Awesome se não estiver presente
if (!document.querySelector('link[href*="font-awesome"]')) {
    const faLink = document.createElement('link');
    faLink.rel = 'stylesheet';
    faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
    document.head.appendChild(faLink);
}

// Exporta para uso global
window.FileUploadPreview = FileUploadPreview;



// Verifica se os elementos existem
console.log('fileInput:', document.getElementById('fileInput'));
console.log('previewContainer:', document.getElementById('previewContainer'));

// Testa manualmente
const testInput = document.getElementById('fileInput');
if (testInput) {
    testInput.addEventListener('change', function(e) {
        console.log('Change event fired!', e.target.files);
        
        // Teste básico
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.style.width = '100px';
                img.style.height = '100px';
                
                const container = document.getElementById('previewContainer');
                if (container) {
                    container.innerHTML = '';
                    container.appendChild(img);
                    console.log('✅ Preview adicionado manualmente!');
                }
            };
            reader.readAsDataURL(file);
        }
    });
}