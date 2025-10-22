/**
 * 🌟 Orion - Dashboard Personalizado
 * JavaScript para análisis personalizados con IA
 */

// Variables globales
let analysisData = null;
let analysisId = null;

// Colores del tema
const colors = {
    primary: '#667eea',
    success: '#11998e',
    warning: '#f093fb',
    danger: '#ff6b6b',
    info: '#4facfe'
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌟 Iniciando Orion - Dashboard Personalizado');
    
    // Obtener ID del análisis de la URL
    const pathParts = window.location.pathname.split('/');
    analysisId = pathParts[pathParts.length - 1];
    
    if (analysisId) {
        loadCustomAnalysis();
    } else {
        showError('ID de análisis no encontrado');
    }
});

/**
 * Cargar análisis personalizado
 */
async function loadCustomAnalysis() {
    try {
        console.log('🔄 Cargando análisis personalizado:', analysisId);
        
        // Mostrar estado de carga
        showLoadingState();
        
        // Cargar métricas personalizadas
        await loadCustomMetrics();
        
        // Cargar gráficos
        await loadCustomCharts();
        
        // Cargar insights
        await loadInsights();
        
        // Ocultar estado de carga
        hideLoadingState();
        
        console.log('✅ Análisis personalizado cargado exitosamente');
        
    } catch (error) {
        console.error('❌ Error cargando análisis personalizado:', error);
        showError('Error cargando análisis personalizado: ' + error.message);
    }
}

/**
 * Cargar métricas personalizadas
 */
async function loadCustomMetrics() {
    try {
        const response = await fetch(`/api/custom-metrics/${analysisId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            analysisData = data.data;
            updateMetrics(analysisData);
            updateAnalysisInfo(analysisData);
        } else {
            throw new Error(data.error || 'Error cargando métricas');
        }
        
    } catch (error) {
        console.error('Error cargando métricas personalizadas:', error);
        throw error;
    }
}

/**
 * Actualizar métricas en la interfaz
 */
function updateMetrics(metrics) {
    // Métricas principales
    document.getElementById('total-casos').textContent = formatNumber(metrics.total_casos || 0);
    document.getElementById('casos-urgentes').textContent = formatNumber(metrics.casos_urgentes || 0);
    document.getElementById('porcentaje-urgentes').textContent = `${metrics.porcentaje_urgentes || 0}%`;
    document.getElementById('alta-prioridad').textContent = formatNumber(metrics.alta_prioridad || 0);
    document.getElementById('porcentaje-alta-prioridad').textContent = `${Math.round((metrics.alta_prioridad / metrics.total_casos) * 100) || 0}%`;
    document.getElementById('calidad-datos').textContent = `${metrics.calidad_datos || 0}%`;
    document.getElementById('completitud').textContent = `${metrics.completitud || 0}%`;
    
    // Análisis de sentimientos
    document.getElementById('casos-positivos').textContent = formatNumber(metrics.casos_positivos || 0);
    document.getElementById('casos-negativos').textContent = formatNumber(metrics.casos_negativos || 0);
    
    // Actualizar barras de calidad
    updateQualityBars(metrics);
}

/**
 * Actualizar información del análisis
 */
function updateAnalysisInfo(metrics) {
    document.getElementById('analysis-id').textContent = analysisId;
    document.getElementById('analysis-date').textContent = new Date().toLocaleDateString('es-ES');
    document.getElementById('total-records').textContent = formatNumber(metrics.total_casos || 0);
    document.getElementById('categories-detected').textContent = metrics.categorias_detectadas || 0;
    document.getElementById('ai-accuracy').textContent = metrics.ai_accuracy || 0;
}

/**
 * Actualizar barras de calidad
 */
function updateQualityBars(metrics) {
    const qualityBar = document.getElementById('quality-bar');
    const completenessBar = document.getElementById('completeness-bar');
    const qualityPercentage = document.getElementById('quality-percentage');
    const completenessPercentage = document.getElementById('completeness-percentage');
    
    if (qualityBar) {
        qualityBar.style.width = `${metrics.calidad_datos || 0}%`;
        qualityPercentage.textContent = `${metrics.calidad_datos || 0}%`;
    }
    
    if (completenessBar) {
        completenessBar.style.width = `${metrics.completitud || 0}%`;
        completenessPercentage.textContent = `${metrics.completitud || 0}%`;
    }
}

/**
 * Cargar gráficos personalizados
 */
async function loadCustomCharts() {
    try {
        // Cargar datos de categorías
        const categoriesData = await loadCategoriesData();
        createCategoryChart(categoriesData);
        
        // Cargar datos de prioridad
        const priorityData = await loadPriorityData();
        createPriorityChart(priorityData);
        
    } catch (error) {
        console.error('Error cargando gráficos personalizados:', error);
    }
}

/**
 * Cargar datos de categorías
 */
async function loadCategoriesData() {
    // Simular datos de categorías basados en el análisis
    const categories = analysisData.categorias_detectadas || 0;
    const total = analysisData.total_casos || 0;
    
    // Generar distribución simulada
    const categoryNames = ['Salud', 'Educación', 'Seguridad', 'Medio Ambiente', 'Transporte', 'Servicios Públicos'];
    const categoryData = {};
    
    for (let i = 0; i < Math.min(categories, categoryNames.length); i++) {
        categoryData[categoryNames[i]] = Math.floor(Math.random() * (total / categories)) + 1;
    }
    
    return categoryData;
}

/**
 * Crear gráfico de categorías
 */
function createCategoryChart(data) {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    
    const labels = Object.keys(data);
    const values = Object.values(data);
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: [
                    colors.primary,
                    colors.success,
                    colors.warning,
                    colors.danger,
                    colors.info,
                    '#9b59b6'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

/**
 * Cargar datos de prioridad
 */
async function loadPriorityData() {
    return {
        'Alta Prioridad': analysisData.alta_prioridad || 0,
        'Media Prioridad': analysisData.media_prioridad || 0,
        'Baja Prioridad': analysisData.baja_prioridad || 0
    };
}

/**
 * Crear gráfico de prioridad
 */
function createPriorityChart(data) {
    const ctx = document.getElementById('priorityChart').getContext('2d');
    
    const labels = Object.keys(data);
    const values = Object.values(data);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Número de Casos',
                data: values,
                backgroundColor: [
                    colors.danger,
                    colors.warning,
                    colors.success
                ],
                borderColor: [
                    colors.danger,
                    colors.warning,
                    colors.success
                ],
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

/**
 * Cargar insights
 */
async function loadInsights() {
    try {
        // Simular insights basados en el análisis
        const insights = generateInsights(analysisData);
        displayInsights(insights);
        
    } catch (error) {
        console.error('Error cargando insights:', error);
    }
}

/**
 * Generar insights basados en los datos
 */
function generateInsights(data) {
    const insights = [];
    
    // Insight de urgencia
    if (data.porcentaje_urgentes > 30) {
        insights.push(`🚨 Alto nivel de urgencia detectado: ${data.porcentaje_urgentes}% de casos requieren atención inmediata`);
    } else if (data.porcentaje_urgentes < 10) {
        insights.push(`✅ Bajo nivel de urgencia: Solo ${data.porcentaje_urgentes}% de casos son urgentes`);
    }
    
    // Insight de prioridad
    const totalPriority = (data.alta_prioridad || 0) + (data.media_prioridad || 0) + (data.baja_prioridad || 0);
    if (data.alta_prioridad > totalPriority * 0.5) {
        insights.push(`⭐ La mayoría de casos (${data.alta_prioridad}) tienen alta prioridad`);
    }
    
    // Insight de sentimientos
    if (data.casos_positivos > data.casos_negativos) {
        insights.push(`😊 Sentimiento predominantemente positivo: ${data.casos_positivos} casos positivos vs ${data.casos_negativos} negativos`);
    } else if (data.casos_negativos > data.casos_positivos) {
        insights.push(`😟 Sentimiento predominantemente negativo: ${data.casos_negativos} casos negativos vs ${data.casos_positivos} positivos`);
    }
    
    // Insight de calidad
    if (data.calidad_datos > 90) {
        insights.push(`🎯 Excelente calidad de datos: ${data.calidad_datos}% de precisión`);
    } else if (data.calidad_datos < 70) {
        insights.push(`⚠️ Calidad de datos mejorable: ${data.calidad_datos}% de precisión`);
    }
    
    // Insight de tamaño
    if (data.total_casos > 1000) {
        insights.push(`📊 Dataset extenso con ${formatNumber(data.total_casos)} registros: Análisis robusto disponible`);
    }
    
    return insights;
}

/**
 * Mostrar insights en la interfaz
 */
function displayInsights(insights) {
    const container = document.getElementById('insights-list');
    
    if (insights.length === 0) {
        container.innerHTML = '<p class="text-muted">No hay insights disponibles para este análisis</p>';
        return;
    }
    
    container.innerHTML = insights.map(insight => `
        <div class="insight-item">
            <i class="fas fa-lightbulb me-2 text-warning"></i>
            ${insight}
        </div>
    `).join('');
}

/**
 * Mostrar estado de carga
 */
function showLoadingState() {
    const elements = ['total-casos', 'casos-urgentes', 'alta-prioridad', 'calidad-datos'];
    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = '...';
        }
    });
}

/**
 * Ocultar estado de carga
 */
function hideLoadingState() {
    // Los datos ya se han cargado en updateMetrics
}

/**
 * Mostrar error
 */
function showError(message) {
    console.error('❌ Error:', message);
    
    const container = document.querySelector('.container-fluid');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger mt-3';
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i> ${message}
    `;
    container.insertBefore(errorDiv, container.firstChild);
}

/**
 * Descargar informe
 */
function downloadReport() {
    console.log('📄 Generando informe para descarga...');
    
    // Simular generación de informe
    const reportData = {
        analysisId: analysisId,
        timestamp: new Date().toISOString(),
        metrics: analysisData
    };
    
    // Crear y descargar archivo JSON
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `orion_analysis_${analysisId}.json`;
    link.click();
    
    // Mostrar mensaje de éxito
    showSuccessMessage('Informe descargado exitosamente');
}

/**
 * Nuevo análisis
 */
function newAnalysis() {
    window.location.href = '/upload';
}

/**
 * Mostrar mensaje de éxito
 */
function showSuccessMessage(message) {
    const container = document.querySelector('.container-fluid');
    const successDiv = document.createElement('div');
    successDiv.className = 'alert alert-success mt-3';
    successDiv.innerHTML = `
        <i class="fas fa-check-circle"></i> ${message}
    `;
    container.insertBefore(successDiv, container.firstChild);
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

/**
 * Formatear número con separadores
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Exportar funciones para uso global
window.downloadReport = downloadReport;
window.newAnalysis = newAnalysis;
