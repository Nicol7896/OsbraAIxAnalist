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
                        label: 'Número de Casos',
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
        const response = await fetch('/api/temporal-trends');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.data.months && data.data.months.length > 0) {
            const chartData = data.data;
            
            const plotData = [{
                x: chartData.months,
                y: chartData.counts,
                type: 'scatter',
                mode: 'lines+markers',
                name: 'Reportes por Mes',
                line: {
                    color: colors.primary,
                    width: 3
                },
                marker: {
                    color: colors.primary,
                    size: 8
                }
            }];
            
            const layout = {
                title: {
                    text: 'Tendencias Mensuales',
                    font: { size: 16 }
                },
                xaxis: {
                    title: 'Mes'
                },
                yaxis: {
                    title: 'Número de Reportes'
                },
                margin: { t: 50, r: 50, b: 50, l: 50 },
                height: 400,
                autosize: true
            };
            
            const config = {
                responsive: true,
                displayModeBar: true,
                displaylogo: false
            };
            
            Plotly.newPlot('temporalChart', plotData, layout, config);
        } else {
            throw new Error('No hay datos temporales disponibles');
        }
    } catch (error) {
        console.error('Error cargando gráfico temporal:', error);
        // Mostrar mensaje de error en el contenedor del gráfico
        const container = document.getElementById('temporalChart');
        container.innerHTML = '<div class="error-message">Error cargando gráfico temporal</div>';
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
    
    // Aquí puedes implementar la lógica de filtrado
    // Por ahora, recargamos todos los datos
    await loadDashboardData();
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
    
    // Recargar datos sin filtros
    loadDashboardData();
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
 * Actualizar gráficos cuando cambien los datos
 */
function refreshCharts() {
    loadCategoryChart();
    loadUrgencyChart();
    loadTemporalChart();
    loadPriorityCases();
}

// Exportar funciones para uso global
window.applyFilters = applyFilters;
window.clearFilters = clearFilters;
window.refreshCharts = refreshCharts;
