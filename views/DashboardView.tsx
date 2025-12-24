
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Reference, Modelista } from '../types';

const DashboardView: React.FC = () => {
  const [data, setData] = useState<{ refs: Reference[], modelistas: Modelista[] }>({ refs: [], modelistas: [] });

  useEffect(() => {
    setData({
      refs: db.getReferencias(),
      modelistas: db.getModelistas()
    });
  }, []);

  const stats = {
    totalRefs: data.refs.length,
    aguardandoRisco: data.refs.filter(r => r.status === 'Aguardando Risco').length,
    recebidos: data.refs.filter(r => r.status === 'Risco Recebido').length,
    pagamentosPendentes: data.refs.filter(r => r.status === 'Risco Recebido').reduce((a, b) => a + (b.valorTotal || 0), 0),
  };

  const getMonthlyData = () => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthName = d.toLocaleString('pt-BR', { month: 'short' });
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      
      const total = data.refs
        .filter(r => r.dataPedido.startsWith(monthKey))
        .reduce((acc, curr) => acc + (curr.comprimentoRisco || 0), 0);
      
      months.push({ name: monthName, total });
    }
    return months;
  };

  const monthlyStats = getMonthlyData();
  const maxTotal = Math.max(...monthlyStats.map(m => m.total), 1);

  return (
    <div className="animate-fade-in">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-gray-800 tracking-tight">Kavin's Dashboard</h1>
        <p className="text-gray-500 font-medium uppercase text-xs tracking-widest">Controle Geral de Produtividade</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <Card title="Total Pedidos" value={stats.totalRefs} icon="📋" color="blue" />
        <Card title="Aguardando Risco" value={stats.aguardandoRisco} icon="⏳" color="yellow" />
        <Card title="Riscos Recebidos" value={stats.recebidos} icon="✅" color="green" />
        <Card title="Pagamentos Pendentes" value={`R$ ${stats.pagamentosPendentes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon="💰" color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center space-x-2">
            <span>📈</span> <span>Produtividade Mensal (Metragem Total)</span>
          </h3>
          <div className="flex items-end justify-between h-48 px-2 space-x-2">
            {monthlyStats.map((m, i) => (
              <div key={i} className="flex flex-col items-center flex-1 group">
                <div 
                  className="w-full bg-blue-500 rounded-t-md transition-all duration-500 hover:bg-blue-600 relative"
                  style={{ height: `${(m.total / maxTotal) * 100}%`, minHeight: m.total > 0 ? '4px' : '0px' }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {m.total.toFixed(2)}m
                  </div>
                </div>
                <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase">{m.name}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Status Operacional dos Riscos</h3>
          <div className="space-y-4">
            {['Aguardando Rolo', 'Aguardando Risco', 'Risco Recebido', 'Pago'].map(status => {
              const count = data.refs.filter(r => r.status === status).length;
              const percent = (count / (data.refs.length || 1)) * 100;
              return (
                <div key={status}>
                  <div className="flex justify-between text-[10px] font-bold mb-1">
                    <span className="text-gray-500 uppercase tracking-wider">{status}</span>
                    <span className="text-gray-900">{count}</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-700 ${
                        status === 'Pago' ? 'bg-green-500' : 
                        status === 'Risco Recebido' ? 'bg-blue-500' : 
                        status === 'Aguardando Risco' ? 'bg-yellow-400' : 'bg-gray-400'
                      }`}
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const Card: React.FC<{ title: string, value: string | number, icon: string, color: string }> = ({ title, value, icon, color }) => {
  const colors: Record<string, string> = {
    blue: 'border-blue-100 text-blue-600',
    yellow: 'border-yellow-100 text-yellow-600',
    green: 'border-green-100 text-green-600',
    red: 'border-red-100 text-red-600',
  };

  return (
    <div className={`bg-white p-6 rounded-2xl shadow-sm border border-l-8 ${colors[color]} transition-transform hover:scale-[1.02]`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{title}</p>
      <p className="text-xl font-black text-gray-800 mt-1 truncate">{value}</p>
    </div>
  );
};

export default DashboardView;
