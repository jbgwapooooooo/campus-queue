import React, { useState } from 'react';
import { LoginForm } from './features/auth/components/LoginForm';
import { RegisterForm } from './features/auth/components/RegisterForm';
import { Dashboard } from './features/dashboard/components/Dashboard';
import { ProfileView } from './features/profile/components/ProfileView';
import './index.css';

function App() {
  const [currentView, setCurrentView] = useState('login'); // 'login', 'register', 'dashboard', 'profile'

  return (
    <>
      {currentView === 'login' && <LoginForm onLogin={() => setCurrentView('dashboard')} onNavigateRegister={() => setCurrentView('register')} />}
      {currentView === 'register' && <RegisterForm onRegister={() => setCurrentView('dashboard')} onNavigateLogin={() => setCurrentView('login')} />}
      {currentView === 'dashboard' && <Dashboard onProfileClick={() => setCurrentView('profile')} />}
      {currentView === 'profile' && <ProfileView onBack={() => setCurrentView('login')} />}
    </>
  );
}

export default App;
