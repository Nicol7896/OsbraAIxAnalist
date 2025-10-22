#!/usr/bin/env python3
"""
Script para crear archivo Excel de prueba
"""

import pandas as pd
import random
from datetime import datetime, timedelta

def crear_archivo_excel():
    """Crear archivo Excel de prueba con datos variados"""
    
    # Datos de ejemplo
    nombres = ['María', 'Juan', 'Ana', 'Carlos', 'Laura', 'Pedro', 'Sofia', 'Roberto', 'Carmen', 'Luis']
    ciudades = ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Bucaramanga', 'Pereira', 'Santa Marta']
    categorias = ['Salud', 'Educación', 'Seguridad', 'Medio Ambiente', 'Transporte', 'Servicios Públicos']
    urgencias = ['Urgente', 'No urgente']
    
    # Generar datos
    datos = []
    for i in range(1, 51):  # 50 registros
        fecha = datetime(2024, 1, 1) + timedelta(days=random.randint(0, 30))
        
        categoria = random.choice(categorias)
        urgencia = random.choice(urgencias)
        
        # Comentarios específicos por categoría
        comentarios = {
            'Salud': [
                'El hospital no tiene medicamentos',
                'Necesitamos más doctores',
                'La clínica está muy lejos',
                'No hay ambulancia disponible',
                'Los medicamentos son muy caros'
            ],
            'Educación': [
                'No hay computadores en la escuela',
                'Los profesores faltan mucho',
                'Necesitamos más libros',
                'La escuela está muy lejos',
                'No hay internet para estudiar'
            ],
            'Seguridad': [
                'Robo en el parque',
                'Los semáforos no funcionan',
                'Asalto en la calle',
                'No hay policía en el barrio',
                'Las calles están muy oscuras'
            ],
            'Medio Ambiente': [
                'La basura no se recoge',
                'Contaminación del aire',
                'No hay parques cerca',
                'El río está contaminado',
                'Falta reciclaje'
            ],
            'Transporte': [
                'Los buses no pasan',
                'El metro está muy lejos',
                'Los taxis son muy caros',
                'No hay ciclovías',
                'El tráfico es terrible'
            ],
            'Servicios Públicos': [
                'No hay agua potable',
                'Se va la luz seguido',
                'El gas es muy caro',
                'No hay alcantarillado',
                'Los servicios son malos'
            ]
        }
        
        comentario = random.choice(comentarios[categoria])
        
        datos.append({
            'ID': i,
            'Nombre': random.choice(nombres),
            'Edad': random.randint(18, 65),
            'Ciudad': random.choice(ciudades),
            'Comentario': comentario,
            'Categoria': categoria,
            'Urgencia': urgencia,
            'Fecha': fecha.strftime('%Y-%m-%d'),
            'Internet': random.choice([0, 1]),
            'Zona_Rural': random.choice([0, 1])
        })
    
    # Crear DataFrame
    df = pd.DataFrame(datos)
    
    # Guardar como Excel
    archivo_excel = 'test_dataset_completo.xlsx'
    df.to_excel(archivo_excel, index=False)
    
    print(f"✅ Archivo Excel creado: {archivo_excel}")
    print(f"📊 Registros: {len(df)}")
    print(f"📋 Columnas: {list(df.columns)}")
    print(f"📈 Categorías: {df['Categoria'].value_counts().to_dict()}")
    print(f"⚡ Urgencias: {df['Urgencia'].value_counts().to_dict()}")
    
    return archivo_excel

if __name__ == "__main__":
    crear_archivo_excel()
