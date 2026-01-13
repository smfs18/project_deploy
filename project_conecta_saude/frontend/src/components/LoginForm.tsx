// src/components/LoginForm.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/api"; // Importar a função de login

interface LoginFormProps {
  onForgotPassword: () => void;
  onRegister: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onForgotPassword,
  onRegister,
}) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Substituir o fetch pela chamada da API
      const data = await login(email, password);

      const token = data.access_token;

      // Salvar o token no localStorage
      localStorage.setItem("token", token);
      if (rememberMe) {
        localStorage.setItem("email", email);
      }

      // Redirecionar para o dashboard
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Erro:", err);
      setError(err.message || "Erro ao tentar fazer login. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-form">
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
            disabled={isLoading}
          />
        </div>

        <div className="form-options">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isLoading}
            />
            Lembrar-me
          </label>

          <button
            type="button"
            className="forgot-password-btn"
            onClick={onForgotPassword}
            disabled={isLoading}
          >
            Esqueci minha senha
          </button>
        </div>

        <button type="submit" className="login-btn" disabled={isLoading}>
          {isLoading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <div className="login-footer">
        <p>
          Não tem uma conta?{" "}
          <button onClick={onRegister} className="text-button" disabled={isLoading}>
            Registre-se
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;