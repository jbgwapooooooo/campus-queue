import React, { useState, useEffect } from 'react';
import { LoginForm } from './features/auth/components/LoginForm';
import { RegisterForm } from './features/auth/components/RegisterForm';
import { Dashboard } from './features/dashboard/components/Dashboard';
import { ProfileView } from './features/profile/components/ProfileView';
import { supabase } from './supabaseClient';
import './index.css';

function App() {
  const [currentView, setCurrentView] = useState('login'); // 'login', 'register', 'dashboard', 'profile'
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session && (currentView === 'login' || currentView === 'register')) {
        setCurrentView('dashboard');
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setCurrentView('dashboard');
      } else {
        setCurrentView('login');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      {currentView === 'login' && <LoginForm onLogin={() => setCurrentView('dashboard')} onNavigateRegister={() => setCurrentView('register')} />}
      {currentView === 'register' && <RegisterForm onRegister={() => setCurrentView('dashboard')} onNavigateLogin={() => setCurrentView('login')} />}
      {currentView === 'dashboard' && <Dashboard onProfileClick={() => setCurrentView('profile')} />}
      {currentView === 'profile' && <ProfileView onBack={() => setCurrentView('dashboard')} />}
    </>
  );
}

export default App;
