/**
 * 🚀 Dashboard JavaScript - Sistema de Análisis Inteligente
 * Reto IBM SenaSoft 2025
 */

// Variables globales
let categoryChart = null;
let urgencyChart = null;
let temporalChart = null;

// Colores para gráficos
const colors = {
    primary: '#667eea',
    success: '#11998e',
    warning: '#f093fb',
    danger: '#f5576c',
    info: '#4facfe',
    light: '#f8f9fa',
    dark: '#343a40'
};

// Inicializar dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando Dashboard del Sistema de Análisis Inteligente');
    loadDashboardData();
});

/**
 * Cargar todos los datos del dashboard
 */
async function loadDashboardData() {
    try {
        console.log('🔄 Iniciando carga del dashboard...');
        
        // Mostrar indicadores de carga
        showLoadingState();
        
        // Cargar métricas principales
        await loadMetrics();
        
        // Cargar gráficos en paralelo para mejor rendimiento
        await Promise.all([
            loadCategoryChart(),
            loadUrgencyChart(),
            loadTemporalChart(),
            loadPriorityCases()
        ]);
        
        console.log('✅ Dashboard cargado exitosamente');
        hideLoadingState();
    } catch (error) {
        console.error('❌ Error cargando dashboard:', error);
        showError('Error cargando datos del dashboard');
        hideLoadingState();
    }
}

/**
 * Cargar métricas principales
 */
async function loadMetrics() {
    try {
        console.log('🔄 Cargando métricas...');
        const response = await fetch('/api/metrics');
        
        console.log('📡 Respuesta de métricas:', response.status, response.statusText);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📊 Datos de métricas recibidos:', data);
        
        if (data.success) {
            const metrics = data.data;
            console.log('✅ Métricas procesadas:', metrics);
            
            document.getElementById('total-casos').textContent = formatNumber(metrics.total_casos || 0);
            document.getElementById('casos-urgentes').textContent = formatNumber(metrics.casos_urgentes || 0);
            document.getElementById('porcentaje-urgentes').textContent = `${metrics.porcentaje_urgentes || 0}%`;
            document.getElementById('zona-rural').textContent = formatNumber(metrics.zona_rural || 0);
            document.getElementById('porcentaje-rural').textContent = `${metrics.porcentaje_rural || 0}%`;
            document.getElementById('sin-internet').textContent = formatNumber(metrics.sin_internet || 0);
            document.getElementById('porcentaje-sin-internet').textContent = `${metrics.porcentaje_sin_internet || 0}%`;
        } else {
            throw new Error(data.error || 'Error desconocido en métricas');
        }
    } catch (error) {
        console.error('❌ Error cargando métricas:', error);
        // Mostrar valores por defecto en caso de error
        document.getElementById('total-casos').textContent = 'Error';
        document.getElementById('casos-urgentes').textContent = 'Error';
        document.getElementById('porcentaje-urgentes').textContent = 'Error';
        document.getElementById('zona-rural').textContent = 'Error';
        document.getElementById('porcentaje-rural').textContent = 'Error';
        document.getElementById('sin-internet').textContent = 'Error';
        document.getElementById('porcentaje-sin-internet').textContent = 'Error';
    }
}

/**
 * Cargar gráfico de distribución por categoría
 */
async function loadCategoryChart() {
    try {
        const response = await fetch('/api/category-distribution');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.data.labels && data.data.labels.length > 0) {
            const chartData = data.data;
            
            const ctx = document.getElementById('categoryChart').getContext('2d');
            
            if (categoryChart) {
                categoryChart.destroy();
            }
            
            categoryChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: chartData.labels,
                    datasets: [{
                        data: chartData.values,
                        backgroundColor: [
                            colors.primary,
                            colors.success,
                            colors.warning,
                            colors.danger
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
        } else {
            throw new Error('No hay datos de categorías disponibles');
        }
    } catch (error) {
        console.error('Error cargando gráfico de categorías:', error);
        // Mostrar mensaje de error en el contenedor del gráfico
        const container = document.querySelector('#categoryChart').parentElement;
        container.innerHTML = '<div class="error-message">Error cargando gráfico de categorías</div>';
    }
}

/**
 * Cargar gráfico de distribución por urgencia
 */
async function loadUrgencyChart() {
    try {
        const response = await fetch('/api/urgency-distribution');
        const data = await response.json();
        
        if (data.success) {
            const chartData = data.data;
            
            const ctx = document.getElementById('urgencyChart').getContext('2d');
            
            if (urgencyChart) {
                urgencyChart.destroy();
            }
            
            urgencyChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: chartData.labels,
                    datasets: [{
                        label: `Total: ${formatNumber(chartData.values.reduce((sum, value) => sum + value, 0))} casos`,
                        data: chartData.values,
                        backgroundColor: [
                            colors.danger,
                            colors.success
                        ],
                        borderColor: [
                            colors.danger,
                            colors.success
                        ],
                        borderWidth: 2
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
    } catch (error) {
        console.error('Error cargando gráfico de urgencia:', error);
    }
}

/**
 * Cargar gráfico de tendencias temporales
 */
async function loadTemporalChart() {
    try {
        console.log('🔄 Cargando gráfico temporal...');
        const response = await fetch('/api/temporal-trends');
        
        console.log('📡 Respuesta de temporal-trends:', response.status, response.statusText);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📊 Datos de temporal-trends recibidos:', data);
        
        if (data.success && data.data.months && data.data.months.length > 0) {
            const chartData = data.data;
            
        // Crear gráfico de barras más amigable para móviles
        const canvas = document.getElementById('temporalChart');
        if (!canvas) {
            throw new Error('Elemento temporalChart no encontrado');
        }
        const ctx = canvas.getContext('2d');
        
        // Destruir gráfico anterior si existe
        if (window.temporalChart) {
            window.temporalChart.destroy();
        }
        
        window.temporalChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: chartData.months,
                datasets: [{
                    label: 'Reportes por Mes',
                    data: chartData.counts,
                    backgroundColor: chartData.counts.map((_, index) => {
                        const colors_array = [colors.primary, colors.success, colors.warning, colors.danger, colors.info];
                        return colors_array[index % colors_array.length];
                    }),
                    borderColor: chartData.counts.map((_, index) => {
                        const colors_array = [colors.primary, colors.success, colors.warning, colors.danger, colors.info];
                        return colors_array[index % colors_array.length];
                    }),
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        borderColor: colors.primary,
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: true
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Mes',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        grid: {
                            display: false
                        },
                        ticks: {
                            maxRotation: 45,
                            minRotation: 0
                        }
                    },
                    y: {
                title: {
                            display: true,
                            text: 'Número de Reportes',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                }
            }
        });
        
        console.log('✅ Gráfico temporal creado exitosamente');
        } else {
            console.log('⚠️ No hay datos temporales disponibles:', data);
            throw new Error('No hay datos temporales disponibles');
        }
    } catch (error) {
        console.error('❌ Error cargando gráfico temporal:', error);
        // Mostrar mensaje de error en el contenedor del gráfico
        const container = document.getElementById('temporalChart');
        if (container) {
            container.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    <strong>Error cargando gráfico temporal:</strong><br>
                    ${error.message}
                </div>
            `;
        } else {
            console.error('❌ No se pudo encontrar el contenedor temporalChart');
        }
    }
}

/**
 * Cargar casos prioritarios
 */
async function loadPriorityCases() {
    try {
        console.log('🔄 Cargando casos prioritarios...');
        const response = await fetch('/api/priority-cases?limit=20');
        
        console.log('📡 Respuesta de casos prioritarios:', response.status, response.statusText);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📊 Datos de casos prioritarios recibidos:', data);
        
        if (data.success) {
            const cases = data.data;
            console.log('✅ Casos prioritarios procesados:', cases.length, 'registros');
            
            // Actualizar lista de casos prioritarios
            updatePriorityCasesList(cases);
            
            // Actualizar tabla
            updatePriorityTable(cases);
        } else {
            throw new Error(data.error || 'Error desconocido en casos prioritarios');
        }
    } catch (error) {
        console.error('❌ Error cargando casos prioritarios:', error);
        // Mostrar mensaje de error en las tablas
        const container = document.getElementById('priority-cases');
        container.innerHTML = '<div class="error-message">Error cargando casos prioritarios</div>';
        
        const tbody = document.getElementById('priority-table');
        tbody.innerHTML = '<tr><td colspan="7" class="text-center error-message">Error cargando datos</td></tr>';
    }
}

/**
 * Actualizar lista de casos prioritarios
 */
function updatePriorityCasesList(cases) {
    const container = document.getElementById('priority-cases');
    
    if (cases.length === 0) {
        container.innerHTML = '<p class="text-muted">No hay casos prioritarios</p>';
        return;
    }
    
    let html = '';
    cases.slice(0, 10).forEach((case_, index) => {
        const priorityClass = getPriorityClass(case_.Prioridad);
        const urgencyIcon = case_['Nivel de urgencia'] === 'Urgente' ? 'fas fa-exclamation-triangle text-danger' : 'fas fa-check-circle text-success';
        
        html += `
            <div class="d-flex justify-content-between align-items-center mb-2 p-2 border rounded">
                <div>
                    <strong>#${case_.ID}</strong> - ${case_['Ciudad']}
                    <br>
                    <small class="text-muted">${case_['Categoría del problema']}</small>
                </div>
                <div class="text-end">
                    <span class="priority-badge ${priorityClass}">${case_.Prioridad}/100</span>
                    <br>
                    <i class="${urgencyIcon}"></i>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

/**
 * Actualizar tabla de casos prioritarios
 */
function updatePriorityTable(cases) {
    const tbody = document.getElementById('priority-table');
    
    if (cases.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No hay casos prioritarios</td></tr>';
        return;
    }
    
    let html = '';
    cases.forEach((case_, index) => {
        const priorityClass = getPriorityClass(case_.Prioridad);
        const urgencyIcon = case_['Nivel de urgencia'] === 'Urgente' ? 'fas fa-exclamation-triangle text-danger' : 'fas fa-check-circle text-success';
        const ruralIcon = case_['Zona rural'] == 1 ? 'fas fa-map-marker-alt text-warning' : 'fas fa-city text-info';
        const internetIcon = case_['Acceso a internet'] == 1 ? 'fas fa-wifi text-success' : 'fas fa-wifi-slash text-danger';
        
        html += `
            <tr>
                <td>${case_.ID}</td>
                <td>${case_['Ciudad']}</td>
                <td>${case_['Categoría del problema']}</td>
                <td><i class="${urgencyIcon}"></i> ${case_['Nivel de urgencia']}</td>
                <td><span class="priority-badge ${priorityClass}">${case_.Prioridad}/100</span></td>
                <td><i class="${ruralIcon}"></i> ${case_['Zona rural'] == 1 ? 'Rural' : 'Urbana'}</td>
                <td><i class="${internetIcon}"></i> ${case_['Acceso a internet'] == 1 ? 'Sí' : 'No'}</td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

/**
 * Obtener clase CSS para prioridad
 */
function getPriorityClass(priority) {
    if (priority >= 80) return 'priority-high';
    if (priority >= 60) return 'priority-medium';
    return 'priority-low';
}

/**
 * Aplicar filtros
 */
async function applyFilters() {
    const categoria = document.getElementById('filter-categoria').value;
    const urgencia = document.getElementById('filter-urgencia').value;
    const fechaInicio = document.getElementById('filter-fecha-inicio').value;
    const fechaFin = document.getElementById('filter-fecha-fin').value;
    
    console.log('Aplicando filtros:', { categoria, urgencia, fechaInicio, fechaFin });
    
    // Validar fechas
    if (!validateDates(fechaInicio, fechaFin)) {
        return;
    }
    
    // Mostrar indicador de carga
    showLoadingState();
    
    try {
        // Cargar datos filtrados
        await loadFilteredData(categoria, urgencia, fechaInicio, fechaFin);
        console.log('✅ Filtros aplicados exitosamente');
        
        // Mostrar estado de filtros activos si hay filtros aplicados
        if (hasActiveFilters()) {
            showFilterStatus();
        } else {
            hideFilterStatus();
        }
    } catch (error) {
        console.error('❌ Error aplicando filtros:', error);
        showError('Error aplicando filtros');
    } finally {
        hideLoadingState();
    }
}

/**
 * Cargar datos filtrados
 */
async function loadFilteredData(categoria, urgencia, fechaInicio, fechaFin) {
    try {
        // Construir URL con parámetros de filtro
        const params = new URLSearchParams();
        if (categoria) params.append('categoria', categoria);
        if (urgencia) params.append('urgencia', urgencia);
        if (fechaInicio) params.append('fecha_inicio', fechaInicio);
        if (fechaFin) params.append('fecha_fin', fechaFin);
        
        const baseUrl = '/api/filtered-metrics';
        const url = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
        
        console.log('🔄 Cargando métricas filtradas...');
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            const metrics = data.data;
            console.log('✅ Métricas filtradas recibidas:', metrics);
            
            // Actualizar métricas en el dashboard
            document.getElementById('total-casos').textContent = formatNumber(metrics.total_casos || 0);
            document.getElementById('casos-urgentes').textContent = formatNumber(metrics.casos_urgentes || 0);
            document.getElementById('porcentaje-urgentes').textContent = `${metrics.porcentaje_urgentes || 0}%`;
            document.getElementById('zona-rural').textContent = formatNumber(metrics.zona_rural || 0);
            document.getElementById('porcentaje-rural').textContent = `${metrics.porcentaje_rural || 0}%`;
            document.getElementById('sin-internet').textContent = formatNumber(metrics.sin_internet || 0);
            document.getElementById('porcentaje-sin-internet').textContent = `${metrics.porcentaje_sin_internet || 0}%`;
            
            // Cargar casos prioritarios filtrados
            await loadFilteredPriorityCases(categoria, urgencia, fechaInicio, fechaFin);
            
            // Actualizar gráficos con filtros
            await loadFilteredCharts(categoria, urgencia, fechaInicio, fechaFin);
            
        } else {
            throw new Error(data.error || 'Error desconocido en métricas filtradas');
        }
    } catch (error) {
        console.error('Error cargando datos filtrados:', error);
        throw error;
    }
}

/**
 * Cargar casos prioritarios filtrados
 */
async function loadFilteredPriorityCases(categoria, urgencia, fechaInicio, fechaFin) {
    try {
        // Construir URL con parámetros de filtro
        const params = new URLSearchParams();
        if (categoria) params.append('categoria', categoria);
        if (urgencia) params.append('urgencia', urgencia);
        if (fechaInicio) params.append('fecha_inicio', fechaInicio);
        if (fechaFin) params.append('fecha_fin', fechaFin);
        params.append('limit', '20');
        
        const baseUrl = '/api/filtered-priority-cases';
        const url = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
        
        console.log('🔄 Cargando casos prioritarios filtrados...');
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            const cases = data.data;
            console.log('✅ Casos prioritarios filtrados recibidos:', cases.length, 'registros');
            
            // Actualizar lista de casos prioritarios
            updatePriorityCasesList(cases);
            
            // Actualizar tabla
            updatePriorityTable(cases);
            
        } else {
            throw new Error(data.error || 'Error desconocido en casos prioritarios filtrados');
        }
    } catch (error) {
        console.error('Error cargando casos prioritarios filtrados:', error);
        // Mostrar mensaje de error en las tablas
        const container = document.getElementById('priority-cases');
        container.innerHTML = '<div class="error-message">Error cargando casos prioritarios filtrados</div>';
        
        const tbody = document.getElementById('priority-table');
        tbody.innerHTML = '<tr><td colspan="7" class="text-center error-message">Error cargando datos filtrados</td></tr>';
    }
}

/**
 * Cargar gráficos filtrados
 */
async function loadFilteredCharts(categoria, urgencia, fechaInicio, fechaFin) {
    try {
        console.log('🔄 Cargando gráficos filtrados...');
        
        // Mostrar indicadores de carga en los gráficos
        showChartLoadingIndicators();
        
        // Construir parámetros de filtro
        const params = new URLSearchParams();
        if (categoria) params.append('categoria', categoria);
        if (urgencia) params.append('urgencia', urgencia);
        if (fechaInicio) params.append('fecha_inicio', fechaInicio);
        if (fechaFin) params.append('fecha_fin', fechaFin);
        
        // Cargar gráficos en paralelo
        await Promise.all([
            loadFilteredCategoryChart(params),
            loadFilteredUrgencyChart(params),
            loadFilteredTemporalChart(params)
        ]);
        
        // Ocultar indicadores de carga
        hideChartLoadingIndicators();
        
        console.log('✅ Gráficos filtrados cargados exitosamente');
        
    } catch (error) {
        console.error('❌ Error cargando gráficos filtrados:', error);
        hideChartLoadingIndicators();
    }
}

/**
 * Mostrar indicadores de carga en gráficos
 */
function showChartLoadingIndicators() {
    // Agregar spinners a los contenedores de gráficos
    const categoryContainer = document.querySelector('#categoryChart').parentElement;
    const urgencyContainer = document.querySelector('#urgencyChart').parentElement;
    const temporalContainer = document.getElementById('temporalChart');
    
    // Crear indicadores de carga si no existen
    if (!document.getElementById('category-loading')) {
        const categoryLoading = document.createElement('div');
        categoryLoading.id = 'category-loading';
        categoryLoading.className = 'chart-loading';
        categoryLoading.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div>';
        categoryContainer.appendChild(categoryLoading);
    }
    
    if (!document.getElementById('urgency-loading')) {
        const urgencyLoading = document.createElement('div');
        urgencyLoading.id = 'urgency-loading';
        urgencyLoading.className = 'chart-loading';
        urgencyLoading.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div>';
        urgencyContainer.appendChild(urgencyLoading);
    }
    
    if (!document.getElementById('temporal-loading')) {
        const temporalLoading = document.createElement('div');
        temporalLoading.id = 'temporal-loading';
        temporalLoading.className = 'chart-loading';
        temporalLoading.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div>';
        temporalContainer.appendChild(temporalLoading);
    }
}

/**
 * Ocultar indicadores de carga en gráficos
 */
function hideChartLoadingIndicators() {
    const loadings = ['category-loading', 'urgency-loading', 'temporal-loading'];
    loadings.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.remove();
        }
    });
}

/**
 * Cargar gráfico de categorías filtrado
 */
async function loadFilteredCategoryChart(params) {
    try {
        const url = `/api/filtered-category-distribution?${params.toString()}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.data.labels && data.data.labels.length > 0) {
            const chartData = data.data;
            
            const ctx = document.getElementById('categoryChart').getContext('2d');
            
            if (categoryChart) {
                categoryChart.destroy();
            }
            
            categoryChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: chartData.labels,
                    datasets: [{
                        data: chartData.values,
                        backgroundColor: [
                            colors.primary,
                            colors.success,
                            colors.warning,
                            colors.danger
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
            
            console.log('✅ Gráfico de categorías filtrado actualizado');
        } else {
            throw new Error('No hay datos de categorías filtradas disponibles');
        }
    } catch (error) {
        console.error('Error cargando gráfico de categorías filtrado:', error);
    }
}

/**
 * Cargar gráfico de urgencia filtrado
 */
async function loadFilteredUrgencyChart(params) {
    try {
        const url = `/api/filtered-urgency-distribution?${params.toString()}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            const chartData = data.data;
            
            const ctx = document.getElementById('urgencyChart').getContext('2d');
            
            if (urgencyChart) {
                urgencyChart.destroy();
            }
            
            urgencyChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: chartData.labels,
                    datasets: [{
                        label: `Total: ${formatNumber(chartData.values.reduce((sum, value) => sum + value, 0))} casos`,
                        data: chartData.values,
                        backgroundColor: [
                            colors.danger,
                            colors.success
                        ],
                        borderColor: [
                            colors.danger,
                            colors.success
                        ],
                        borderWidth: 2
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
            
            console.log('✅ Gráfico de urgencia filtrado actualizado');
        }
    } catch (error) {
        console.error('Error cargando gráfico de urgencia filtrado:', error);
    }
}

/**
 * Cargar gráfico temporal filtrado
 */
async function loadFilteredTemporalChart(params) {
    try {
        const url = `/api/filtered-temporal-trends?${params.toString()}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.data.months && data.data.months.length > 0) {
            const chartData = data.data;
            
            // Crear gráfico de barras filtrado más amigable para móviles
            const ctx = document.getElementById('temporalChart').getContext('2d');
            
            // Destruir gráfico anterior si existe
            if (window.temporalChart) {
                window.temporalChart.destroy();
            }
            
            window.temporalChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: chartData.months,
                    datasets: [{
                        label: 'Reportes por Mes (Filtrados)',
                        data: chartData.counts,
                        backgroundColor: chartData.counts.map((_, index) => {
                            const colors_array = [colors.primary, colors.success, colors.warning, colors.danger, colors.info];
                            return colors_array[index % colors_array.length];
                        }),
                        borderColor: chartData.counts.map((_, index) => {
                            const colors_array = [colors.primary, colors.success, colors.warning, colors.danger, colors.info];
                            return colors_array[index % colors_array.length];
                        }),
                        borderWidth: 2,
                        borderRadius: 8,
                        borderSkipped: false,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top'
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            titleColor: 'white',
                            bodyColor: 'white',
                            borderColor: colors.primary,
                            borderWidth: 1,
                            cornerRadius: 8,
                            displayColors: true
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Mes',
                                font: {
                                    size: 14,
                                    weight: 'bold'
                                }
                            },
                            grid: {
                                display: false
                            },
                            ticks: {
                                maxRotation: 45,
                                minRotation: 0
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Número de Reportes',
                                font: {
                                    size: 14,
                                    weight: 'bold'
                                }
                            },
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(0,0,0,0.1)'
                            }
                        }
                    },
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    },
                    animation: {
                        duration: 1000,
                        easing: 'easeInOutQuart'
                    }
                }
            });
            
            console.log('✅ Gráfico temporal filtrado actualizado');
        } else {
            throw new Error('No hay datos temporales filtrados disponibles');
        }
    } catch (error) {
        console.error('Error cargando gráfico temporal filtrado:', error);
    }
}

/**
 * Validar fechas
 */
function validateDates(fechaInicio, fechaFin) {
    // Si no hay fechas, está bien
    if (!fechaInicio && !fechaFin) {
        return true;
    }
    
    // Validar formato de fecha
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    
    if (fechaInicio && !dateRegex.test(fechaInicio)) {
        showError('Formato de fecha de inicio inválido. Use YYYY-MM-DD');
        return false;
    }
    
    if (fechaFin && !dateRegex.test(fechaFin)) {
        showError('Formato de fecha de fin inválido. Use YYYY-MM-DD');
        return false;
    }
    
    // Validar rango de años (2020-2025)
    const minYear = 2020;
    const maxYear = 2025;
    
    if (fechaInicio) {
        const yearInicio = new Date(fechaInicio).getFullYear();
        if (yearInicio < minYear || yearInicio > maxYear) {
            showError(`La fecha de inicio debe estar entre ${minYear} y ${maxYear}`);
            return false;
        }
    }
    
    if (fechaFin) {
        const yearFin = new Date(fechaFin).getFullYear();
        if (yearFin < minYear || yearFin > maxYear) {
            showError(`La fecha de fin debe estar entre ${minYear} y ${maxYear}`);
            return false;
        }
    }
    
    // Validar que fecha de inicio sea anterior a fecha de fin
    if (fechaInicio && fechaFin) {
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        
        if (inicio > fin) {
            showError('La fecha de inicio debe ser anterior a la fecha de fin');
            return false;
        }
    }
    
    return true;
}

/**
 * Limpiar filtros
 */
function clearFilters() {
    document.getElementById('filter-categoria').value = '';
    document.getElementById('filter-urgencia').value = '';
    document.getElementById('filter-fecha-inicio').value = '';
    document.getElementById('filter-fecha-fin').value = '';
    
    console.log('🧹 Limpiando filtros y recargando datos...');
    
    // Ocultar indicador de filtros activos
    hideFilterStatus();
    
    // Mostrar indicador de carga
    showLoadingState();
    
    // Recargar datos sin filtros
    loadDashboardData().finally(() => {
        hideLoadingState();
        console.log('✅ Filtros limpiados y datos recargados');
    });
}

/**
 * Mostrar estado de filtros activos
 */
function showFilterStatus() {
    const filterStatus = document.getElementById('filter-status');
    if (filterStatus) {
        filterStatus.style.display = 'block';
        filterStatus.className = 'badge bg-primary';
        filterStatus.innerHTML = '<i class="fas fa-filter"></i> Filtros activos';
    }
}

/**
 * Ocultar estado de filtros activos
 */
function hideFilterStatus() {
    const filterStatus = document.getElementById('filter-status');
    if (filterStatus) {
        filterStatus.style.display = 'none';
    }
}

/**
 * Verificar si hay filtros activos
 */
function hasActiveFilters() {
    const categoria = document.getElementById('filter-categoria').value;
    const urgencia = document.getElementById('filter-urgencia').value;
    const fechaInicio = document.getElementById('filter-fecha-inicio').value;
    const fechaFin = document.getElementById('filter-fecha-fin').value;
    
    return categoria || urgencia || fechaInicio || fechaFin;
}

/**
 * Mostrar estado de carga
 */
function showLoadingState() {
    // Los indicadores de carga ya están en el HTML
    console.log('🔄 Mostrando estado de carga...');
}

/**
 * Ocultar estado de carga
 */
function hideLoadingState() {
    // Ocultar spinners y mostrar contenido
    const loaders = document.querySelectorAll('.spinner-border');
    loaders.forEach(loader => {
        loader.style.display = 'none';
    });
    console.log('✅ Estado de carga oculto');
}

/**
 * Mostrar error
 */
function showError(message) {
    console.error('Error:', message);
    
    // Crear elemento de error si no existe
    let errorDiv = document.getElementById('error-message');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'error-message';
        errorDiv.className = 'error-message';
        document.body.insertBefore(errorDiv, document.body.firstChild);
    }
    
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    // Ocultar después de 5 segundos
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

/**
 * Formatear número con separadores de miles
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Actualizar dashboard completo
 */
function refreshDashboard() {
    console.log('🔄 Actualizando dashboard...');
    
    // Mostrar indicador de carga
    showLoadingState();
    
    // Recargar todos los datos
    loadDashboardData().finally(() => {
        hideLoadingState();
        console.log('✅ Dashboard actualizado exitosamente');
        
        // Mostrar mensaje de éxito
        showSuccessMessage('Dashboard actualizado correctamente');
    });
}

/**
 * Mostrar mensaje de éxito
 */
function showSuccessMessage(message) {
    // Crear o actualizar mensaje de éxito
    let successDiv = document.getElementById('success-message');
    if (!successDiv) {
        successDiv = document.createElement('div');
        successDiv.id = 'success-message';
        successDiv.className = 'alert alert-success mt-3';
        document.querySelector('.container-fluid').insertBefore(successDiv, document.querySelector('.filter-section'));
    }
    
    successDiv.innerHTML = `
        <i class="fas fa-check-circle"></i> ${message}
    `;
    successDiv.style.display = 'block';
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
        successDiv.style.display = 'none';
    }, 3000);
}

// Exportar función para uso global
window.refreshDashboard = refreshDashboard;

/**
 * Actualizar gráficos cuando cambien los datos
 */
function refreshCharts() {
    loadCategoryChart();
    loadUrgencyChart();
    loadTemporalChart();
    loadPriorityCases();
}

/**
 * Analizar problemas del dashboard
 */
async function analyzeProblems() {
    try {
        console.log('🔍 Iniciando análisis de problemas...');
        
        // Mostrar indicador de carga
        const container = document.getElementById('problemsContainer');
        container.innerHTML = `
            <div class="text-center py-4">
                <div class="spinner-border text-primary mb-3" role="status">
                    <span class="visually-hidden">Analizando...</span>
                </div>
                <p class="text-muted">Analizando datos para detectar problemas...</p>
            </div>
        `;
        
        // Llamar a la API
        const response = await fetch('/api/dashboard-problems');
        
        if (!response.ok) {
            throw new Error(`Error del servidor: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Análisis completado:', result.data);
            displayProblemsAndSolutions(result.data);
        } else {
            throw new Error(result.error || 'Error en el análisis');
        }
        
    } catch (error) {
        console.error('❌ Error analizando problemas:', error);
        showProblemsError('Error analizando problemas: ' + error.message);
    }
}

/**
 * Mostrar problemas y soluciones
 */
function displayProblemsAndSolutions(data) {
    const container = document.getElementById('problemsContainer');
    
    if (data.total_problems === 0) {
        container.innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-check-circle fa-3x text-success mb-3"></i>
                <h5 class="text-success">¡Excelente!</h5>
                <p class="text-muted">No se detectaron problemas críticos en los datos.</p>
                <small class="text-muted">Última actualización: ${new Date(data.analysis_timestamp).toLocaleString()}</small>
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="row mb-3">
            <div class="col-md-6">
                <div class="alert alert-info mb-0">
                    <i class="fas fa-info-circle me-2"></i>
                    <strong>${data.total_problems}</strong> problemas detectados
                </div>
            </div>
            <div class="col-md-6">
                <div class="alert alert-danger mb-0">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    <strong>${data.critical_problems}</strong> problemas críticos
                </div>
            </div>
        </div>
    `;
    
    // Mostrar problemas
    html += '<div class="row mb-4">';
    html += '<div class="col-12"><h6><i class="fas fa-exclamation-triangle me-2"></i>Problemas Detectados</h6></div>';
    
    data.problems.forEach(problem => {
        html += `
            <div class="col-md-6 mb-3">
                <div class="card problem-card ${problem.severity}">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h6 class="card-title mb-0">${problem.title}</h6>
                            <span class="severity-badge severity-${problem.severity}">${problem.severity.toUpperCase()}</span>
                        </div>
                        <p class="card-text text-muted small">${problem.description}</p>
                        <small class="text-muted">
                            <i class="fas fa-tag me-1"></i>${problem.category} | 
                            <i class="fas fa-bullseye me-1"></i>${problem.impact}
                        </small>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    
    // Mostrar soluciones
    html += '<div class="row mb-4">';
    html += '<div class="col-12"><h6><i class="fas fa-lightbulb me-2"></i>Soluciones Propuestas</h6></div>';
    
    data.problems.forEach(problem => {
        const solution = data.solutions[problem.id];
        if (solution) {
            html += `
                <div class="col-md-6 mb-3">
                    <div class="card solution-card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <h6 class="card-title mb-0">${solution.title}</h6>
                                <span class="priority-badge priority-${solution.priority}">${solution.priority.toUpperCase()}</span>
                            </div>
                            <p class="card-text text-muted small">${solution.description}</p>
                            <div class="mt-2">
                                <small class="text-muted">
                                    <i class="fas fa-clock me-1"></i>Tiempo estimado: ${solution.estimated_time}
                                </small>
                            </div>
                            <div class="mt-2">
                                <button class="btn btn-outline-primary btn-sm" onclick="showSolutionDetails('${problem.id}')">
                                    <i class="fas fa-list me-1"></i>Ver pasos
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    });
    
    html += '</div>';
    
    // Mostrar plan de acción
    html += '<div class="row">';
    html += '<div class="col-12"><h6><i class="fas fa-tasks me-2"></i>Plan de Acción</h6></div>';
    
    const actionPlan = data.action_plan;
    const timeframes = [
        { key: 'immediate_actions', title: 'Acciones Inmediatas', class: 'immediate', icon: 'fas fa-bolt' },
        { key: 'short_term_actions', title: 'Corto Plazo (1-4 semanas)', class: 'short-term', icon: 'fas fa-clock' },
        { key: 'medium_term_actions', title: 'Mediano Plazo (1-3 meses)', class: 'medium-term', icon: 'fas fa-calendar' },
        { key: 'long_term_actions', title: 'Largo Plazo (3+ meses)', class: 'long-term', icon: 'fas fa-calendar-alt' }
    ];
    
    timeframes.forEach(timeframe => {
        const actions = actionPlan[timeframe.key];
        if (actions && actions.length > 0) {
            html += `
                <div class="col-md-6 mb-3">
                    <div class="card">
                        <div class="card-header">
                            <h6 class="mb-0">
                                <i class="${timeframe.icon} me-2"></i>${timeframe.title}
                            </h6>
                        </div>
                        <div class="card-body">
            `;
            
            actions.forEach(action => {
                html += `
                    <div class="action-plan-item ${timeframe.class}">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <strong>${action.solution_title}</strong>
                                <p class="mb-1 text-muted small">${action.problem_title}</p>
                                <small class="text-muted">
                                    <i class="fas fa-clock me-1"></i>${action.estimated_time}
                                </small>
                            </div>
                            <span class="priority-badge priority-${action.priority}">${action.priority.toUpperCase()}</span>
                        </div>
                    </div>
                `;
            });
            
            html += `
                        </div>
                    </div>
                </div>
            `;
        }
    });
    
    html += '</div>';
    
    // Agregar timestamp
    html += `
        <div class="row mt-3">
            <div class="col-12">
                <small class="text-muted">
                    <i class="fas fa-clock me-1"></i>
                    Última actualización: ${new Date(data.analysis_timestamp).toLocaleString()}
                </small>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

/**
 * Mostrar detalles de una solución
 */
function showSolutionDetails(problemId) {
    // Esta función se puede expandir para mostrar un modal con los pasos detallados
    console.log('Mostrando detalles para problema:', problemId);
    // Por ahora, solo mostramos un alert
    alert('Función de detalles en desarrollo. Próximamente se mostrará un modal con los pasos detallados.');
}

/**
 * Mostrar error en el análisis de problemas
 */
function showProblemsError(message) {
    const container = document.getElementById('problemsContainer');
    container.innerHTML = `
        <div class="alert alert-danger">
            <i class="fas fa-exclamation-triangle me-2"></i>
            <strong>Error:</strong> ${message}
        </div>
    `;
}

// Exportar funciones para uso global
window.applyFilters = applyFilters;
window.clearFilters = clearFilters;
window.refreshCharts = refreshCharts;
window.analyzeProblems = analyzeProblems;
window.showSolutionDetails = showSolutionDetails;
