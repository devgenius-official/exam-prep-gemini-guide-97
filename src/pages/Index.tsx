
import { useState } from 'react';
import LoginForm from '@/components/LoginForm';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  const handleLogin = (user: string) => {
    // Store username in sessionStorage
    sessionStorage.setItem('username', user);
    // Redirect to dashboard
    navigate('/dashboard');
  };

  return <LoginForm onLogin={handleLogin} />;
};

export default Index;
