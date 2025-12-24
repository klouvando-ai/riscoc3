
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Reference, Modelista } from '../types';

const FinanceView: React.FC = () => {
  const [refs, setRefs] = useState<Reference[]>([]);
  const [modelistas, setModelistas] = useState<Modelista[]>([]);
  const [filterModelista, setFilterModelista] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Apenas riscos recebidos ou pagos aparecem no financeiro
    const allRefs = db.getReferencias().filter(r => r.status === 'Risco Recebido' || r.status === 'Pago');
    setRefs(allRefs);
    setModelistas(db.getModelistas());
  };

  const filteredRefs = refs.filter(r => {
    const matchModelista = filterModelista === '' || r.modelistaId === filterModelista;
    const matchStatus = filterStatus === 'Todos' || 
                        (filterStatus === 'Aberto' && r.status === 'Risco Recebido') ||
                        (filterStatus === 'Pago' && r.status === 'Pago');
    return matchModelista && matchStatus;
  });

  const totals = {
    aberto: filteredRefs.filter(r => r.status === 'Risco Recebido').reduce((acc, curr) => acc + (curr.valorTotal || 0), 0),
    pago: filteredRefs.filter(r => r.status === 'Pago').reduce((acc, curr) => acc + (curr.valorTotal || 0), 0),
    total: filteredRefs.reduce((acc, curr) => acc + (curr.valorTotal || 0), 0)
  };

  const handlePay = (id: string) => {
    const ref = refs.find(r => r.id === id);
    if (!ref) return;
    if (confirm(`Confirmar pagamento da referência ${ref.codigo}?`)) {
      const updated: Reference = {
        ...ref,
        status: 'Pago',
        dataPagamento: new Date().toISOString().split('T')[0]
      };
      db.saveReferencia(updated);
      loadData();
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Financeiro</h1>
        <p className="text-gray-500">Controle de liquidação de riscos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-blue-500">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Filtrado</p>
          <p className="text-2xl font-black text-blue-600">R$ {totals.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-red-500">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Pendente (Aberto)</p>
          <p className="text-2xl font-black text-red-600">R$ {totals.aberto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-green-500">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Liquidado (Pago)</p>
          <p className="text-2xl font-black text-green-600">R$ {totals.pago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Filtrar Modelista</label>
          <select 
            className="px-4 py-2 border rounded-lg outline-none text-sm bg-gray-50 focus:bg-white"
            value={filterModelista}
            onChange={(e) => setFilterModelista(e.target.value)}
          >
            <option value="">Todas as Modelistas</option>
            {modelistas.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Status</label>
          <div className="flex bg-gray-100 p-1 rounded-lg">
            {['Todos', 'Aberto', 'Pago'].map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                  filterStatus === s ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase">Recebimento</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase">Referência / Modelista</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase text-center">Metragens (Risco)</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase">Total</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase text-center">Status</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredRefs.map(r => {
              const m = modelistas.find(mod => mod.id === r.modelistaId);
              return (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-500">{r.dataRecebimento ? new Date(r.dataRecebimento).toLocaleDateString() : '-'}</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-800">{r.codigo}</p>
                    <p className="text-[10px] text-gray-400 uppercase">{m?.nome}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-mono font-bold text-blue-600">{r.comprimentoRisco?.toFixed(2)}m</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-black text-gray-800">R$ {r.valorTotal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    <p className="text-[9px] text-gray-400">V. Metro: R$ {m?.valorPorMetro.toFixed(2)}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${
                      r.status === 'Pago' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {r.status === 'Pago' ? 'LIQUIDADO' : 'EM ABERTO'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {r.status === 'Risco Recebido' && (
                      <button
                        onClick={() => handlePay(r.id)}
                        className="bg-green-600 hover:bg-green-700 text-white text-[10px] font-black py-2 px-4 rounded-lg uppercase shadow-sm transition-all"
                      >
                        Pagar
                      </button>
                    )}
                    {r.status === 'Pago' && <span className="text-[10px] text-gray-400 italic">Pago em {r.dataPagamento ? new Date(r.dataPagamento).toLocaleDateString() : ''}</span>}
                  </td>
                </tr>
              );
            })}
            {filteredRefs.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">Nenhum registro encontrado para os filtros selecionados.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinanceView;
