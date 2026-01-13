// src/components/Register.tsx
import React, { useState } from 'react';
import { register } from '../services/api'; // Importar a função de registro

interface RegisterProps {
  onBack: () => void;
}

const Register: React.FC<RegisterProps> = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    setIsLoading(true);
    try {
      // Substituir o fetch pela chamada da API (URL corrigida)
      const data = await register(email, password);

      // Salvar o token retornado
      localStorage.setItem('token', data.access_token);
      setSuccess(true);
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);

    } catch (err: any) {
      console.error('Erro:', err);
      setError(err.message || 'Erro ao tentar registrar. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-form">
      <div className="login-header">
        <h1>Registro</h1>
        <p>Crie sua conta no Conect Saúde</p>
      </div>

      {success ? (
        <div className="success-message">
          Registro realizado com sucesso! Redirecionando...
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
              required
              minLength={6}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirme a senha</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Digite a senha novamente"
              required
              minLength={6}
              disabled={isLoading}
            />
          </div>

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? "Registrando..." : "Registrar"}
          </button>

          <button 
            type="button" 
            className="back-to-login-btn" 
            onClick={onBack} 
            disabled={isLoading}
          >
            Voltar para o login
          </button>
        </form>
      )}
    </div>
  );
};

export default Register;