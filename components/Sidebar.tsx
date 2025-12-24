
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User } from '../types';

const Sidebar: React.FC<{ user: User, onLogout: () => void }> = ({ user, onLogout }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/modelistas', label: 'Modelistas', icon: '🧵' },
    { path: '/referencias', label: 'Preferências / Riscos', icon: '📋' },
    { path: '/entrada-risco', label: 'Entrada de Risco', icon: '📥' },
    { path: '/financeiro', label: 'Financeiro', icon: '💰' },
    { path: '/relatorios', label: 'Relatórios', icon: '📄' },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col h-screen no-print">
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-xl font-bold tracking-tight text-blue-400">KAVIN'S</h2>
        <p className="text-xs text-gray-500 mt-1 uppercase font-bold">Controle de Produção</p>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
              location.pathname === item.path
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium text-sm">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-6 border-t border-gray-800 bg-gray-900/50">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-xs text-white">
            {user.username[0].toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white truncate">{user.username}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-tighter">{user.role}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full text-left flex items-center space-x-2 text-sm text-gray-400 hover:text-red-400 transition-colors"
        >
          <span>🚪</span>
          <span>Sair do Sistema</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
