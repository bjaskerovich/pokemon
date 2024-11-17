'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { PokemonList } from './components/PokemonList';

export default function Home() {
  const { token, isLoading } = useAuth();
  const [showLogin, setShowLogin] = useState(true);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (token) {
    return <PokemonList />;
  }

  return showLogin ? (
    <Login onSwitchToRegister={() => setShowLogin(false)} />
  ) : (
    <Register onSwitchToLogin={() => setShowLogin(true)} />
  );
}