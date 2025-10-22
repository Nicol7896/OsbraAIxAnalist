/**
 * 🌟 Orion - Sistema de Carga y Análisis Personalizado
 * JavaScript para manejo de carga de archivos y análisis personalizado
 */

// Variables globales
let currentFile = null;
let analysisData = null;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌟 Iniciando Orion - Análisis Personalizado');
    initializeUpload();
});

/**
 * Inicializar funcionalidad de carga
 */
function initializeUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    
    // Eventos de drag and drop
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    // Evento de clic para seleccionar archivo
    uploadArea.addEventListener('click', () => fileInput.click());
    
    // Evento de cambio de archivo
    fileInput.addEventListener('change', handleFileSelect);
    
    console.log('✅ Funcionalidad de carga inicializada');
}

/**
 * Manejar drag over
 */
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('dragover');
}

/**
 * Manejar drag leave
 */
function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('dragover');
}

/**
 * Manejar drop de archivo
 */
function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

/**
 * Manejar selección de archivo
 */
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

/**
 * Procesar archivo seleccionado
 */
function handleFile(file) {
    console.log('📁 Archivo seleccionado:', file.name);
    
    // Validar tipo de archivo
    if (!validateFile(file)) {
        return;
    }
    
    currentFile = file;
    
    // Mostrar información del archivo
    showFileInfo(file);
    
    // Iniciar análisis
    startAnalysis(file);
}

/**
 * Validar archivo
 */
function validateFile(file) {
    const allowedTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/csv',
        'text/plain'
    ];
    
    const allowedExtensions = ['.csv', '.xlsx', '.xls'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    // Validar extensión
    if (!allowedExtensions.includes(fileExtension)) {
        showError('Tipo de archivo no soportado. Use CSV o Excel (.xlsx, .xls)');
        return false;
    }
    
    // Validar tamaño
    if (file.size > 50 * 1024 * 1024) { // 50MB
        showError('El archivo es demasiado grande. Máximo 50MB');
        return false;
    }
    
    // Validar que no esté vacío
    if (file.size === 0) {
        showError('El archivo está vacío. Seleccione un archivo válido.');
        return false;
    }
    
    // Validar nombre del archivo
    if (file.name.length > 255) {
        showError('El nombre del archivo es demasiado largo. Use un nombre más corto.');
        return false;
    }
    
    // Validar caracteres especiales en el nombre
    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(file.name)) {
        showError('El nombre del archivo contiene caracteres no válidos. Use solo letras, números y guiones.');
        return false;
    }
    
    return true;
}

/**
 * Mostrar información del archivo
 */
function showFileInfo(file) {
    const uploadArea = document.getElementById('uploadArea');
    uploadArea.innerHTML = `
        <div class="upload-icon text-success">
            <i class="fas fa-check-circle"></i>
        </div>
        <h4 class="text-success">Archivo Seleccionado</h4>
        <p><strong>${file.name}</strong></p>
        <p class="text-muted">Tamaño: ${formatFileSize(file.size)}</p>
        <button class="btn btn-outline-secondary btn-sm" onclick="resetUpload()">
            <i class="fas fa-times"></i> Cambiar Archivo
        </button>
    `;
}

/**
 * Iniciar análisis del archivo
 */
async function startAnalysis(file) {
    console.log('🔄 Iniciando análisis del archivo...');
    
    // Mostrar progreso
    showProgress();
    
    try {
        // Crear FormData para envío
        const formData = new FormData();
        formData.append('file', file);
        formData.append('analysis_type', 'custom');
        
        // Simular progreso
        simulateProgress();
        
        // Enviar archivo al servidor
        const response = await fetch('/api/upload-dataset', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`Error del servidor: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Análisis completado:', result.data);
            analysisData = result.data;
            showAnalysisPreview(result.data);
        } else {
            throw new Error(result.error || 'Error en el análisis');
        }
        
    } catch (error) {
        console.error('❌ Error en análisis:', error);
        
        // Determinar el tipo de error y mostrar mensaje apropiado
        let errorMessage = 'Error procesando el archivo';
        
        if (error.message.includes('500')) {
            errorMessage = 'Error interno del servidor. Verifique que el archivo no esté corrupto y tenga el formato correcto.';
        } else if (error.message.includes('400')) {
            errorMessage = 'Formato de archivo no válido. Use archivos CSV o Excel (.xlsx, .xls).';
        } else if (error.message.includes('413')) {
            errorMessage = 'El archivo es demasiado grande. Máximo 50MB.';
        } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
            errorMessage = 'Error de conexión. Verifique su conexión a internet e intente nuevamente.';
        } else if (error.message.includes('timeout')) {
            errorMessage = 'El archivo está tardando mucho en procesarse. Intente con un archivo más pequeño.';
        } else {
            errorMessage = `Error: ${error.message}`;
        }
        
        showError(errorMessage);
        hideProgress();
    }
}

/**
 * Simular progreso de análisis
 */
function simulateProgress() {
    const progressBar = document.querySelector('.progress-bar');
    const progressText = document.getElementById('progressText');
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 90) progress = 90;
        
        progressBar.style.width = progress + '%';
        
        if (progress < 30) {
            progressText.textContent = 'Cargando archivo...';
        } else if (progress < 60) {
            progressText.textContent = 'Procesando datos...';
        } else if (progress < 90) {
            progressText.textContent = 'Aplicando IA...';
        } else {
            progressText.textContent = 'Finalizando análisis...';
        }
        
        if (progress >= 90) {
            clearInterval(interval);
        }
    }, 200);
}

/**
 * Mostrar progreso
 */
function showProgress() {
    document.getElementById('progressContainer').style.display = 'block';
    document.getElementById('analysisPreview').style.display = 'none';
}

/**
 * Ocultar progreso
 */
function hideProgress() {
    document.getElementById('progressContainer').style.display = 'none';
}

/**
 * Mostrar preview del análisis
 */
function showAnalysisPreview(data) {
    console.log('📊 Mostrando preview del análisis:', data);
    
    // Ocultar progreso
    hideProgress();
    
    // Mostrar métricas
    const previewMetrics = document.getElementById('previewMetrics');
    // Obtener datos del análisis
    const urgencyAnalysis = data.urgency_analysis || {};
    const sentimentAnalysis = data.sentiment_analysis || {};
    const priorityAnalysis = data.priority_analysis || {};
    const dataQuality = data.data_quality || {};
    
    previewMetrics.innerHTML = `
        <div class="col-md-6">
            <div class="metric-card">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-1">Total Registros</h6>
                        <h3>${formatNumber(data.total_records || 0)}</h3>
                    </div>
                    <i class="fas fa-database fa-2x"></i>
                </div>
            </div>
        </div>
        <div class="col-md-6">
            <div class="metric-card success">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-1">Categorías Detectadas</h6>
                        <h3>${data.categories_analysis?.total_categories || 0}</h3>
                    </div>
                    <i class="fas fa-tags fa-2x"></i>
                </div>
            </div>
        </div>
        <div class="col-md-6">
            <div class="metric-card warning">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-1">Casos Urgentes</h6>
                        <h3>${formatNumber(urgencyAnalysis.urgent_cases || 0)}</h3>
                        <small>${urgencyAnalysis.urgency_percentage || 0}% del total</small>
                    </div>
                    <i class="fas fa-exclamation-triangle fa-2x"></i>
                </div>
            </div>
        </div>
        <div class="col-md-6">
            <div class="metric-card info">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-1">Precisión IA</h6>
                        <h3>${data.ai_accuracy || 0}%</h3>
                        <small>Calidad: ${dataQuality.quality_score || 0}%</small>
                    </div>
                    <i class="fas fa-brain fa-2x"></i>
                </div>
            </div>
        </div>
        <div class="col-md-6">
            <div class="metric-card" style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-1">Casos Positivos</h6>
                        <h3>${formatNumber(sentimentAnalysis.positive_cases || 0)}</h3>
                    </div>
                    <i class="fas fa-smile fa-2x"></i>
                </div>
            </div>
        </div>
        <div class="col-md-6">
            <div class="metric-card" style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-1">Alta Prioridad</h6>
                        <h3>${formatNumber(priorityAnalysis.high_priority || 0)}</h3>
                    </div>
                    <i class="fas fa-star fa-2x"></i>
                </div>
            </div>
        </div>
    `;
    
    // Mostrar preview
    document.getElementById('analysisPreview').style.display = 'block';
}

/**
 * Generar informe completo
 */
async function generateFullReport() {
    if (!analysisData) {
        showError('No hay datos de análisis disponibles');
        return;
    }
    
    console.log('📄 Generando informe completo...');
    
    try {
        // Mostrar indicador de carga
        const button = event.target;
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generando...';
        button.disabled = true;
        
        // Solicitar informe completo
        const response = await fetch('/api/generate-report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                analysis_id: analysisData.analysis_id,
                report_type: 'full'
            })
        });
        
        if (!response.ok) {
            throw new Error(`Error del servidor: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            // Redirigir al dashboard personalizado
            window.location.href = `/dashboard/custom/${result.report_id}`;
        } else {
            throw new Error(result.error || 'Error generando informe');
        }
        
    } catch (error) {
        console.error('❌ Error generando informe:', error);
        showError('Error generando informe: ' + error.message);
        
        // Restaurar botón
        button.innerHTML = originalText;
        button.disabled = false;
    }
}

/**
 * Resetear carga
 */
function resetUpload() {
    console.log('🔄 Reseteando carga...');
    
    // Limpiar variables
    currentFile = null;
    analysisData = null;
    
    // Restaurar área de carga
    const uploadArea = document.getElementById('uploadArea');
    uploadArea.innerHTML = `
        <div class="upload-icon">
            <i class="fas fa-cloud-upload-alt"></i>
        </div>
        <h4>Arrastra tu dataset aquí</h4>
        <p class="text-muted">o haz clic para seleccionar un archivo</p>
        <p class="small text-muted">
            Formatos soportados: CSV, Excel (.xlsx, .xls)
        </p>
        <input type="file" id="fileInput" accept=".csv,.xlsx,.xls" style="display: none;">
    `;
    
    // Ocultar elementos
    document.getElementById('progressContainer').style.display = 'none';
    document.getElementById('analysisPreview').style.display = 'none';
    
    // Re-inicializar eventos
    initializeUpload();
}

/**
 * Mostrar error
 */
function showError(message) {
    console.error('❌ Error:', message);
    
    // Crear o actualizar mensaje de error
    let errorDiv = document.getElementById('error-message');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'error-message';
        errorDiv.className = 'alert alert-danger mt-3';
        errorDiv.style.position = 'fixed';
        errorDiv.style.top = '20px';
        errorDiv.style.left = '50%';
        errorDiv.style.transform = 'translateX(-50%)';
        errorDiv.style.zIndex = '9999';
        errorDiv.style.minWidth = '400px';
        errorDiv.style.maxWidth = '80%';
        document.body.appendChild(errorDiv);
    }
    
    errorDiv.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="fas fa-exclamation-triangle me-2"></i>
            <div>
                <strong>Error:</strong> ${message}
            </div>
            <button type="button" class="btn-close ms-auto" onclick="this.parentElement.parentElement.style.display='none'"></button>
        </div>
    `;
    errorDiv.style.display = 'block';
    
    // Ocultar después de 8 segundos
    setTimeout(() => {
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
    }, 8000);
}

/**
 * Formatear tamaño de archivo
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Formatear número con separadores
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Exportar funciones para uso global
window.generateFullReport = generateFullReport;
window.resetUpload = resetUpload;
