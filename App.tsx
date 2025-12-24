
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { User, UserRole } from './types';
import Sidebar from './components/Sidebar';
import ModelistasView from './views/ModelistasView';
import ReferenciasView from './views/ReferenciasView';
import RiskEntryView from './views/RiskEntryView';
import FinanceView from './views/FinanceView';
import ReportsView from './views/ReportsView';
import DashboardView from './views/DashboardView';

const Login: React.FC<{ onLogin: (user: User) => void }> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'kavins' && password === 'kavins2026') {
      onLogin({ username: 'kavins', role: UserRole.ADMIN });
    } else {
      setError('Credenciais inválidas. Verifique usuário e senha.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border-t-4 border-blue-600">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Kavin's</h1>
          <p className="text-gray-500 text-sm mt-2 font-medium">Controle de Risco de Corte</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Usuário</label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Senha</label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-lg active:scale-[0.98]"
          >
            Acessar Sistema
          </button>
        </form>
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Modo 100% Offline</p>
        </div>
      </div>
    </div>
  );
};

const ProtectedLayout: React.FC<{ user: User, onLogout: () => void }> = ({ user, onLogout }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={user} onLogout={onLogout} />
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <Routes>
          <Route path="/" element={<DashboardView />} />
          <Route path="/modelistas" element={<ModelistasView />} />
          <Route path="/referencias" element={<ReferenciasView />} />
          <Route path="/entrada-risco" element={<RiskEntryView />} />
          <Route path="/financeiro" element={<FinanceView />} />
          <Route path="/relatorios" element={<ReportsView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('kavins_session');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('kavins_session', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('kavins_session');
  };

  return (
    <HashRouter>
      {!user ? (
        <Routes>
          <Route path="*" element={<Login onLogin={handleLogin} />} />
        </Routes>
      ) : (
        <ProtectedLayout user={user} onLogout={handleLogout} />
      )}
    </HashRouter>
  );
};

export default App;
