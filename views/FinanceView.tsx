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
    // Apenas itens recebidos ou pagos
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
    if (confirm(`Confirmar liquidação (pagamento) da referência ${ref.codigo}?`)) {
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
        <p className="text-gray-500 text-sm">Controle de pagamentos às modelistas.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 text-center">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Selecionado</p>
          <p className="text-2xl font-black text-blue-600">R$ {totals.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100 text-center">
          <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Pendente</p>
          <p className="text-2xl font-black text-red-600">R$ {totals.aberto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-100 text-center">
          <p className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-1">Liquidado</p>
          <p className="text-2xl font-black text-green-600">R$ {totals.pago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-6 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-wider">Filtrar Modelista</label>
          <select 
            className="w-full px-4 py-2.5 border rounded-xl outline-none text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
            value={filterModelista}
            onChange={(e) => setFilterModelista(e.target.value)}
          >
            <option value="">Todas as Modelistas</option>
            {modelistas.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-wider">Status Financeiro</label>
          <div className="flex bg-gray-100 p-1 rounded-xl">
            {['Todos', 'Aberto', 'Pago'].map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`flex-1 px-4 py-2 text-xs font-black rounded-lg transition-all uppercase tracking-tighter ${
                  filterStatus === s ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Recebimento</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Ref. / Modelista</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Metragem Risco</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Valor Bruto</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredRefs.map(r => {
                const m = modelistas.find(mod => mod.id === r.modelistaId);
                return (
                  <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-xs font-medium text-gray-500">
                      {r.dataRecebimento ? new Date(r.dataRecebimento).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-800 uppercase">{r.codigo}</p>
                      <p className="text-[10px] text-blue-500 font-bold">{m?.nome}</p>
                    </td>
                    <td className="px-6 py-4 text-center font-mono font-bold text-gray-700">
                      {r.comprimentoRisco?.toFixed(2)}m
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-black text-gray-900">R$ {r.valorTotal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      <p className="text-[9px] text-gray-400 font-bold uppercase">R$ {m?.valorPorMetro.toFixed(2)} /m</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase inline-block min-w-[85px] ${
                        r.status === 'Pago' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {r.status === 'Pago' ? 'LIQUIDADO' : 'EM ABERTO'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {r.status === 'Risco Recebido' ? (
                        <button
                          onClick={() => handlePay(r.id)}
                          className="bg-green-600 hover:bg-green-700 text-white text-[10px] font-black py-2 px-4 rounded-lg uppercase shadow-sm transition-all active:scale-95"
                        >
                          Liquidar
                        </button>
                      ) : (
                        <div className="flex flex-col items-end opacity-50">
                          <span className="text-[9px] font-black text-green-700">PAGO EM</span>
                          <span className="text-[10px] text-gray-500">{r.dataPagamento ? new Date(r.dataPagamento).toLocaleDateString() : '-'}</span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinanceView;