#!/usr/bin/env python3
"""
Script de prueba para verificar la funcionalidad de carga de archivos
"""

import requests
import os
import json

def test_upload():
    """Probar la funcionalidad de carga de archivos"""
    
    # URL del servidor (ajustar según corresponda)
    base_url = "http://localhost:5000"
    upload_url = f"{base_url}/api/upload-dataset"
    
    # Archivo de prueba
    test_file = "ejemplo_dataset.csv"
    
    if not os.path.exists(test_file):
        print(f"❌ Archivo de prueba no encontrado: {test_file}")
        return False
    
    print(f"🔄 Probando carga de archivo: {test_file}")
    
    try:
        # Preparar archivo para envío
        with open(test_file, 'rb') as f:
            files = {'file': (test_file, f, 'text/csv')}
            data = {'analysis_type': 'custom'}
            
            # Enviar request
            response = requests.post(upload_url, files=files, data=data, timeout=30)
            
            print(f"📊 Status Code: {response.status_code}")
            print(f"📋 Headers: {dict(response.headers)}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Éxito: {json.dumps(result, indent=2)}")
                return True
            else:
                print(f"❌ Error {response.status_code}: {response.text}")
                return False
                
    except requests.exceptions.RequestException as e:
        print(f"❌ Error de conexión: {e}")
        return False
    except Exception as e:
        print(f"❌ Error inesperado: {e}")
        return False

def test_server_status():
    """Probar si el servidor está funcionando"""
    base_url = "http://localhost:5000"
    
    try:
        response = requests.get(f"{base_url}/", timeout=5)
        if response.status_code == 200:
            print("✅ Servidor funcionando correctamente")
            return True
        else:
            print(f"⚠️ Servidor respondió con código: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Servidor no disponible: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Iniciando pruebas de carga de archivos...")
    
    # Probar servidor
    if not test_server_status():
        print("❌ No se puede continuar sin servidor")
        exit(1)
    
    # Probar carga
    if test_upload():
        print("✅ Prueba de carga exitosa")
    else:
        print("❌ Prueba de carga falló")
