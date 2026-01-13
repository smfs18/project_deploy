// src/components/ForgotPassword.tsx
import React, { useState } from 'react';

interface ForgotPasswordProps {
  onBackToLogin: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Password recovery for:', email);
    // Aqui você implementaria a lógica de recuperação de senha
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="forgot-password">
        <div className="login-header">
          <h1>E-mail Enviado</h1>
          <p>Enviamos um link de recuperação para seu e-mail</p>
        </div>
        
        <div className="success-message">
          <p>Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.</p>
        </div>

        <button 
          onClick={onBackToLogin}
          className="back-to-login-btn"
        >
          Voltar para o Login
        </button>
      </div>
    );
  }

  return (
    <div className="forgot-password">
      <div className="login-header">
        <h1>Recuperar Senha</h1>
        <p>Digite seu e-mail para receber o link de recuperação</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="recovery-email">E-mail</label>
          <input
            type="email"
            id="recovery-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
          />
        </div>

        <button type="submit" className="recovery-btn">
          Enviar Link de Recuperação
        </button>
      </form>

      <button 
        onClick={onBackToLogin}
        className="back-to-login-btn"
      >
        Voltar para o Login
      </button>
    </div>
  );
};

export default ForgotPassword;