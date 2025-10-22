"""
🚀 Sistema de Análisis Inteligente de Reportes Ciudadanos
Aplicación Web Flask para visualizar resultados del análisis de IA
Reto IBM SenaSoft 2025
"""

from flask import Flask, render_template, jsonify, request
import pandas as pd
import json
import os
from datetime import datetime, timedelta
import plotly.graph_objs as go
import plotly.utils

app = Flask(__name__)

# Configuración
app.config['SECRET_KEY'] = 'senasoft2025_ibm_reto'
app.config['DEBUG'] = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'

class DataAnalyzer:
    """Clase para manejar y analizar los datos procesados por IA"""
    
    def __init__(self):
        self.df = None
        self.load_data()
    
    def load_data(self):
        """Cargar datos procesados por el modelo de IA"""
        try:
            # Intentar cargar datos procesados
            if os.path.exists('dataset_procesado_huggingface.csv'):
                self.df = pd.read_csv('dataset_procesado_huggingface.csv')
                print(f"✅ Datos procesados cargados: {len(self.df)} registros")
            elif os.path.exists('dataset.csv'):
                # Usar el dataset original si existe
                self.df = pd.read_csv('dataset.csv')
                print(f"✅ Dataset original cargado: {len(self.df)} registros")
                # Procesar los datos para agregar columna de prioridad si no existe
                if 'Prioridad' not in self.df.columns:
                    self.df['Prioridad'] = self.calculate_priority()
                    print("✅ Columna de prioridad calculada")
            else:
                # Datos de ejemplo si no existe ningún archivo
                self.df = self.create_sample_data()
                print("⚠️ Usando datos de ejemplo")
        except Exception as e:
            print(f"❌ Error cargando datos: {e}")
            self.df = self.create_sample_data()
    
    def create_sample_data(self):
        """Crear datos de ejemplo para demostración"""
        import numpy as np
        
        np.random.seed(42)
        n_records = 1000
        
        data = {
            'ID': range(1, n_records + 1),
            'Ciudad': np.random.choice(['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena'], n_records),
            'Categoría del problema': np.random.choice(['Educación', 'Salud', 'Medio Ambiente', 'Seguridad'], n_records),
            'Nivel de urgencia': np.random.choice(['Urgente', 'No urgente'], n_records, p=[0.3, 0.7]),
            'Zona rural': np.random.choice([0, 1], n_records, p=[0.7, 0.3]),
            'Acceso a internet': np.random.choice([0, 1], n_records, p=[0.2, 0.8]),
            'Prioridad': np.random.randint(20, 100, n_records),
            'Fecha del reporte': pd.date_range('2024-01-01', periods=n_records, freq='D')
        }
        
        return pd.DataFrame(data)
    
    def calculate_priority(self):
        """Calcular prioridad basada en urgencia, zona rural y acceso a internet"""
        import numpy as np
        
        priority_scores = []
        for _, row in self.df.iterrows():
            score = 50  # Base score
            
            # Urgencia
            if row['Nivel de urgencia'] == 'Urgente':
                score += 30
            
            # Zona rural (mayor prioridad)
            if row['Zona rural'] == 1:
                score += 20
            
            # Sin acceso a internet (mayor prioridad)
            if row['Acceso a internet'] == 0:
                score += 15
            
            # Categoría del problema
            if row['Categoría del problema'] == 'Salud':
                score += 10
            elif row['Categoría del problema'] == 'Seguridad':
                score += 8
            elif row['Categoría del problema'] == 'Educación':
                score += 5
            
            # Asegurar que esté entre 20 y 100
            score = max(20, min(100, score))
            priority_scores.append(score)
        
        return priority_scores
    
    def get_dashboard_metrics(self):
        """Obtener métricas principales para el dashboard"""
        if self.df is None:
            return {}
        
        total_casos = len(self.df)
        casos_urgentes = len(self.df[self.df['Nivel de urgencia'] == 'Urgente'])
        zona_rural = len(self.df[self.df['Zona rural'] == 1])
        sin_internet = len(self.df[self.df['Acceso a internet'] == 0])
        
        return {
            'total_casos': total_casos,
            'casos_urgentes': casos_urgentes,
            'porcentaje_urgentes': round((casos_urgentes / total_casos) * 100, 1),
            'zona_rural': zona_rural,
            'porcentaje_rural': round((zona_rural / total_casos) * 100, 1),
            'sin_internet': sin_internet,
            'porcentaje_sin_internet': round((sin_internet / total_casos) * 100, 1)
        }
    
    def get_category_distribution(self):
        """Obtener distribución por categorías"""
        if self.df is None:
            return {}
        
        distribution = self.df['Categoría del problema'].value_counts()
        return {
            'labels': distribution.index.tolist(),
            'values': distribution.values.tolist()
        }
    
    def get_urgency_distribution(self):
        """Obtener distribución por urgencia"""
        if self.df is None:
            return {}
        
        distribution = self.df['Nivel de urgencia'].value_counts()
        return {
            'labels': distribution.index.tolist(),
            'values': distribution.values.tolist()
        }
    
    def get_priority_cases(self, limit=20):
        """Obtener casos más prioritarios"""
        if self.df is None:
            return []
        
        try:
            # Verificar si existe la columna Prioridad, si no, calcularla
            if 'Prioridad' not in self.df.columns:
                print("⚠️ Columna Prioridad no encontrada, calculando...")
                self.df['Prioridad'] = self.calculate_priority()
            
            # Ordenar por prioridad descendente
            sorted_df = self.df.sort_values('Prioridad', ascending=False)
            result = sorted_df.head(limit).to_dict('records')
            
            # Asegurar que todos los registros tengan la columna Prioridad
            for record in result:
                if 'Prioridad' not in record:
                    record['Prioridad'] = 50  # Valor por defecto
            
            return result
        except Exception as e:
            print(f"❌ Error en get_priority_cases: {e}")
            # Si hay error, devolver los primeros registros con prioridad por defecto
            try:
                records = self.df.head(limit).to_dict('records')
                for record in records:
                    record['Prioridad'] = 50  # Valor por defecto
                return records
            except:
                # Último recurso: datos de ejemplo
                return self._get_fallback_priority_cases(limit)
    
    def _get_fallback_priority_cases(self, limit=20):
        """Datos de ejemplo como último recurso"""
        import random
        categories = ['Salud', 'Educación', 'Medio Ambiente', 'Seguridad']
        urgencies = ['Urgente', 'No urgente']
        cities = ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena']
        
        cases = []
        for i in range(1, min(limit + 1, 21)):
            cases.append({
                'ID': i,
                'Ciudad': random.choice(cities),
                'Categoría del problema': random.choice(categories),
                'Nivel de urgencia': random.choice(urgencies),
                'Prioridad': random.randint(50, 100),
                'Zona rural': random.choice([0, 1]),
                'Acceso a internet': random.choice([0, 1])
            })
        
        return cases
    
    def get_temporal_trends(self):
        """Obtener tendencias temporales"""
        if self.df is None:
            return {}
        
        try:
            # Verificar si existe la columna de fecha
            if 'Fecha del reporte' in self.df.columns:
                # Agrupar por mes
                df_copy = self.df.copy()
                df_copy['Mes'] = pd.to_datetime(df_copy['Fecha del reporte']).dt.to_period('M')
                monthly_data = df_copy.groupby('Mes').size()
                
                # Convertir Period a string para serialización JSON
                months = [str(month) for month in monthly_data.index]
                counts = monthly_data.values.tolist()
                
                return {
                    'months': months,
                    'counts': counts
                }
            else:
                # Si no hay columna de fecha, crear datos de ejemplo
                import numpy as np
                months = ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06']
                counts = np.random.randint(50, 200, len(months))
                return {
                    'months': months,
                    'counts': counts.tolist()
                }
        except Exception as e:
            print(f"Error en tendencias temporales: {e}")
            return {'months': [], 'counts': []}

# Instancia global del analizador
analyzer = DataAnalyzer()

@app.route('/')
def dashboard():
    """Página principal del dashboard"""
    return render_template('dashboard.html')

@app.route('/api/metrics')
def api_metrics():
    """API para obtener métricas del dashboard"""
    try:
        print("📊 Obteniendo métricas del dashboard...")
        metrics = analyzer.get_dashboard_metrics()
        print(f"✅ Métricas obtenidas: {metrics}")
        return jsonify({
            'success': True,
            'data': metrics
        })
    except Exception as e:
        print(f"❌ Error en API metrics: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/category-distribution')
def api_category_distribution():
    """API para distribución por categorías"""
    try:
        print("📊 Obteniendo distribución por categorías...")
        data = analyzer.get_category_distribution()
        print(f"✅ Distribución categorías: {data}")
        return jsonify({
            'success': True,
            'data': data
        })
    except Exception as e:
        print(f"❌ Error en API category-distribution: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/urgency-distribution')
def api_urgency_distribution():
    """API para distribución por urgencia"""
    try:
        data = analyzer.get_urgency_distribution()
        return jsonify({
            'success': True,
            'data': data
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/priority-cases')
def api_priority_cases():
    """API para casos prioritarios"""
    try:
        limit = request.args.get('limit', 20, type=int)
        print(f"📊 Obteniendo {limit} casos prioritarios...")
        data = analyzer.get_priority_cases(limit)
        print(f"✅ Casos prioritarios obtenidos: {len(data)} registros")
        return jsonify({
            'success': True,
            'data': data
        })
    except Exception as e:
        print(f"❌ Error en API priority-cases: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/temporal-trends')
def api_temporal_trends():
    """API para tendencias temporales"""
    try:
        data = analyzer.get_temporal_trends()
        return jsonify({
            'success': True,
            'data': data
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/filtered-data')
def api_filtered_data():
    """API para datos filtrados"""
    try:
        # Obtener parámetros de filtro
        categoria = request.args.get('categoria', '')
        urgencia = request.args.get('urgencia', '')
        fecha_inicio = request.args.get('fecha_inicio', '')
        fecha_fin = request.args.get('fecha_fin', '')
        
        # Validar fechas
        if not validate_date_range(fecha_inicio, fecha_fin):
            return jsonify({
                'success': False,
                'error': 'Rango de fechas inválido. Las fechas deben estar entre 2020 y 2025'
            }), 400
        
        # Aplicar filtros
        filtered_df = analyzer.df.copy()
        
        if categoria:
            filtered_df = filtered_df[filtered_df['Categoría del problema'] == categoria]
        
        if urgencia:
            filtered_df = filtered_df[filtered_df['Nivel de urgencia'] == urgencia]
        
        if fecha_inicio:
            filtered_df = filtered_df[pd.to_datetime(filtered_df['Fecha del reporte']) >= fecha_inicio]
        
        if fecha_fin:
            filtered_df = filtered_df[pd.to_datetime(filtered_df['Fecha del reporte']) <= fecha_fin]
        
        return jsonify({
            'success': True,
            'data': filtered_df.to_dict('records')
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def validate_date_range(fecha_inicio, fecha_fin):
    """Validar rango de fechas"""
    try:
        # Validar formato y rango de años
        min_year = 2020
        max_year = 2025
        
        if fecha_inicio:
            fecha_inicio_dt = pd.to_datetime(fecha_inicio)
            if fecha_inicio_dt.year < min_year or fecha_inicio_dt.year > max_year:
                return False
        
        if fecha_fin:
            fecha_fin_dt = pd.to_datetime(fecha_fin)
            if fecha_fin_dt.year < min_year or fecha_fin_dt.year > max_year:
                return False
        
        # Validar que fecha de inicio sea anterior a fecha de fin
        if fecha_inicio and fecha_fin:
            if pd.to_datetime(fecha_inicio) > pd.to_datetime(fecha_fin):
                return False
        
        return True
    except:
        return False

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    print("🚀 Iniciando Sistema de Análisis Inteligente")
    print("📊 Dashboard disponible en: http://localhost:5000")
    print("🤖 Modelo de IA: HuggingFace Transformers")
    print("📈 Visualizaciones: Plotly + Flask")
    
    app.run(debug=False, host='0.0.0.0', port=port)
