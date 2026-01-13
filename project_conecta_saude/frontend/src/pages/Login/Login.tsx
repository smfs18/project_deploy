import React, { useState } from "react";
import LoginForm from "../../components/LoginForm";
import ForgotPassword from "../../components/ForgotPassword";
import Register from "../../components/Register";
import "./Login.css";

const Login: React.FC = () => {
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo-container">
          <div className="logo-cross"></div>
          <div className="logo-text-container">
            <h1 className="logo-text-top">Conecta</h1>
            <h1 className="logo-text-bottom">Saúde</h1>
          </div>
        </div>

        <div className="login-form-side">
          {showRegister ? (
            <Register onBack={() => setShowRegister(false)} />
          ) : showForgotPassword ? (
            <ForgotPassword
              onBackToLogin={() => setShowForgotPassword(false)}
            />
          ) : (
            <LoginForm
              onForgotPassword={() => setShowForgotPassword(true)}
              onRegister={() => setShowRegister(true)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
