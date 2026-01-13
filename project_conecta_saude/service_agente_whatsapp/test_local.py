#!/usr/bin/env python3
"""
Script de exemplo para testar o Service Agente WhatsApp localmente.
"""

import requests
import json
from datetime import datetime

# Configuração
BASE_URL = "http://localhost:8002/api/v1"
SESSION_ID = f"test_session_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

def print_separator():
    print("\n" + "="*70 + "\n")

def send_message(message: str, patient_email: str = None, auth_token: str = None) -> dict:
    """Envia uma mensagem para o agente."""
    payload = {
        "session_id": SESSION_ID,
        "message": message
    }
    
    if patient_email:
        payload["patient_email"] = patient_email
    if auth_token:
        payload["auth_token"] = auth_token
    
    try:
        response = requests.post(f"{BASE_URL}/chat", json=payload)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"❌ Erro ao enviar mensagem: {e}")
        return None

def test_basic_conversation():
    """Testa uma conversa básica sem dados do backend."""
    print("🧪 TESTE 1: Conversa Básica (Sem Dados do Backend)")
    print_separator()
    
    messages = [
        "Olá",
        "Minha pressão hoje está 130/85",
        "Minha glicemia está em 110",
        "Estou me alimentando bem, diria que minha dieta está boa",
        "Durmo bem, cerca de 7 horas por noite"
    ]
    
    for i, msg in enumerate(messages, 1):
        print(f"👤 Paciente: {msg}")
        response = send_message(msg)
        
        if response:
            print(f"🤖 LIA: {response['response']}")
        else:
            print("❌ Falha na comunicação")
            break
        
        print()
    
    print_separator()

def test_emergency_detection():
    """Testa a detecção de emergências."""
    print("🧪 TESTE 2: Detecção de Emergência")
    print_separator()
    
    emergency_session = f"emergency_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    emergency_message = "Estou com uma dor muito forte no peito e falta de ar"
    
    print(f"👤 Paciente: {emergency_message}")
    
    payload = {
        "session_id": emergency_session,
        "message": emergency_message
    }
    
    response = requests.post(f"{BASE_URL}/chat", json=payload)
    
    if response.status_code == 200:
        result = response.json()
        print(f"🤖 LIA: {result['response']}")
        
        if "emergência" in result['response'].lower() or "samu" in result['response'].lower():
            print("✅ Emergência detectada corretamente!")
        else:
            print("⚠️ Emergência não foi detectada")
    else:
        print("❌ Erro na detecção de emergência")
    
    print_separator()

def test_with_patient_data():
    """Testa conversa com dados do paciente (requer backend rodando)."""
    print("🧪 TESTE 3: Conversa com Dados do Paciente")
    print_separator()
    
    # Nota: Este teste requer:
    # 1. Backend rodando
    # 2. Token de autenticação válido
    # 3. Paciente cadastrado no banco
    
    print("⚠️  Este teste requer:")
    print("   - Backend rodando em http://localhost:8000")
    print("   - Token de autenticação válido")
    print("   - Paciente cadastrado no banco")
    print()
    
    patient_email = input("Digite o email do paciente (ou Enter para pular): ").strip()
    
    if not patient_email:
        print("⏭️  Teste pulado")
        print_separator()
        return
    
    auth_token = input("Digite o token de autenticação: ").strip()
    
    if not auth_token:
        print("⏭️  Teste pulado (token não fornecido)")
        print_separator()
        return
    
    print()
    print(f"👤 Paciente: Olá")
    response = send_message("Olá", patient_email=patient_email, auth_token=auth_token)
    
    if response:
        print(f"🤖 LIA: {response['response']}")
        print()
        print("✅ Teste com dados do paciente executado!")
    else:
        print("❌ Falha ao comunicar com backend")
    
    print_separator()

def test_reset_session():
    """Testa o reset de sessão."""
    print("🧪 TESTE 4: Reset de Sessão")
    print_separator()
    
    try:
        response = requests.post(f"{BASE_URL}/reset-session", params={"session_id": SESSION_ID})
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ {result['message']}")
        else:
            print(f"❌ Erro ao resetar sessão: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Erro ao resetar sessão: {e}")
    
    print_separator()

def main():
    """Função principal."""
    print("\n🤖 Service Agente WhatsApp - Testes Locais")
    print_separator()
    
    # Verifica se o serviço está rodando
    try:
        response = requests.get("http://localhost:8002/")
        if response.status_code == 200:
            print("✅ Serviço está rodando!")
            print(f"   Session ID para testes: {SESSION_ID}")
        else:
            print("⚠️  Serviço respondeu, mas com erro")
    except requests.exceptions.RequestException:
        print("❌ Serviço não está rodando!")
        print("   Execute: python main.py")
        return
    
    print_separator()
    
    # Menu de testes
    while True:
        print("\nEscolha um teste:")
        print("1. Conversa Básica")
        print("2. Detecção de Emergência")
        print("3. Conversa com Dados do Paciente")
        print("4. Reset de Sessão")
        print("5. Executar Todos")
        print("0. Sair")
        
        choice = input("\nOpção: ").strip()
        
        if choice == "1":
            test_basic_conversation()
        elif choice == "2":
            test_emergency_detection()
        elif choice == "3":
            test_with_patient_data()
        elif choice == "4":
            test_reset_session()
        elif choice == "5":
            test_basic_conversation()
            test_emergency_detection()
            test_with_patient_data()
            test_reset_session()
        elif choice == "0":
            print("\n👋 Até logo!")
            break
        else:
            print("❌ Opção inválida!")

if __name__ == "__main__":
    main()
