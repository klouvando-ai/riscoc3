
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Reference, Modelista } from '../types';

const ReportsView: React.FC = () => {
  const [refs, setRefs] = useState<Reference[]>([]);
  const [modelistas, setModelistas] = useState<Modelista[]>([]);
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterModelista, setFilterModelista] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setRefs(db.getReferencias());
    setModelistas(db.getModelistas());
  };

  const filteredRefs = refs.filter(r => {
    const matchModelista = filterModelista === '' || r.modelistaId === filterModelista;
    const matchStart = startDate === '' || r.dataPedido >= startDate;
    const matchEnd = endDate === '' || r.dataPedido <= endDate;
    return matchModelista && matchStart && matchEnd;
  });

  const totals = {
    producao: filteredRefs.reduce((a, b) => a + (b.comprimentoRisco || 0), 0),
    liquidado: filteredRefs.filter(r => r.status === 'Pago').reduce((a, b) => a + (b.valorTotal || 0), 0),
    pendente: filteredRefs.filter(r => r.status === 'Risco Recebido').reduce((a, b) => a + (b.valorTotal || 0), 0),
    valorTotal: filteredRefs.reduce((a, b) => a + (b.valorTotal || 0), 0)
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8 no-print">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Relatórios</h1>
          <p className="text-gray-500 text-sm">Geração de documentos consolidados de produção.</p>
        </div>
        <button
          onClick={handlePrint}
          className="bg-gray-900 hover:bg-black text-white font-bold py-2.5 px-6 rounded-xl shadow-lg transition-all flex items-center space-x-2"
        >
          <span>🖨️</span>
          <span className="text-sm">Imprimir Relatório</span>
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 no-print grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Data Início</label>
          <input 
            type="date" 
            className="w-full px-4 py-2.5 border rounded-xl outline-none text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all" 
            value={startDate} 
            onChange={e => setStartDate(e.target.value)} 
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Data Fim</label>
          <input 
            type="date" 
            className="w-full px-4 py-2.5 border rounded-xl outline-none text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all" 
            value={endDate} 
            onChange={e => setEndDate(e.target.value)} 
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Modelista</label>
          <select 
            className="w-full px-4 py-2.5 border rounded-xl outline-none text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all" 
            value={filterModelista} 
            onChange={e => setFilterModelista(e.target.value)}
          >
            <option value="">Todas</option>
            {modelistas.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
          </select>
        </div>
        <div className="flex">
          <button 
            onClick={() => { setStartDate(''); setEndDate(''); setFilterModelista(''); }} 
            className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
          >
            Limpar Filtros
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 no-print">
        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Produção Total</p>
          <p className="text-2xl font-black text-blue-700">{totals.producao.toFixed(2)}m</p>
        </div>
        <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
          <p className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-1">Total Liquidado</p>
          <p className="text-2xl font-black text-green-700">R$ {totals.liquidado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
          <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Total Pendente</p>
          <p className="text-2xl font-black text-red-700">R$ {totals.pendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 print:shadow-none print:border-none print:p-0 print:bg-white">
        <div className="text-center mb-10 pb-8 border-b-4 border-gray-900">
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">Relatório de Produção - Kavin's</h2>
          <div className="flex justify-center space-x-6 mt-4 text-[10px] font-black uppercase text-gray-600 tracking-widest">
            <span className="bg-gray-100 px-3 py-1 rounded">De: {startDate ? new Date(startDate).toLocaleDateString() : 'Início'} Até: {endDate ? new Date(endDate).toLocaleDateString() : 'Hoje'}</span>
            <span className="bg-gray-100 px-3 py-1 rounded">Modelista: {modelistas.find(m => m.id === filterModelista)?.nome || 'TODAS'}</span>
          </div>
          <p className="text-gray-400 text-[9px] mt-4 font-bold uppercase">Emitido em: {new Date().toLocaleString('pt-BR')}</p>
        </div>

        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full text-[10px] border-collapse">
            <thead>
              <tr className="bg-gray-900 text-white">
                <th className="px-3 py-3 border border-gray-900 text-left uppercase font-black">Data Ped.</th>
                <th className="px-3 py-3 border border-gray-900 text-left uppercase font-black">Referência</th>
                <th className="px-3 py-3 border border-gray-900 text-center uppercase font-black">Rolo Máx</th>
                <th className="px-3 py-3 border border-gray-900 text-center uppercase font-black">Rolo Mín</th>
                <th className="px-3 py-3 border border-gray-900 text-left uppercase font-black">Modelista</th>
                <th className="px-3 py-3 border border-gray-900 text-center uppercase font-black">C. Risco</th>
                <th className="px-3 py-3 border border-gray-900 text-center uppercase font-black">Recebim.</th>
                <th className="px-3 py-3 border border-gray-900 text-right uppercase font-black">Valor Total</th>
                <th className="px-3 py-3 border border-gray-900 text-center uppercase font-black">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRefs.map(r => {
                const m = modelistas.find(mod => mod.id === r.modelistaId);
                return (
                  <tr key={r.id} className="odd:bg-white even:bg-gray-50 transition-colors">
                    <td className="px-3 py-2 border border-gray-300">{new Date(r.dataPedido).toLocaleDateString()}</td>
                    <td className="px-3 py-2 border border-gray-300 font-bold">{r.codigo}</td>
                    <td className="px-3 py-2 border border-gray-300 text-center font-mono">{r.maiorMedida.toFixed(2)}m</td>
                    <td className="px-3 py-2 border border-gray-300 text-center font-mono text-gray-400">{r.menorMedida.toFixed(2)}m</td>
                    <td className="px-3 py-2 border border-gray-300 font-medium truncate max-w-[120px]">{m?.nome || '-'}</td>
                    <td className="px-3 py-2 border border-gray-300 text-center font-black">{r.comprimentoRisco ? `${r.comprimentoRisco.toFixed(2)}m` : '-'}</td>
                    <td className="px-3 py-2 border border-gray-300 text-center">{r.dataRecebimento ? new Date(r.dataRecebimento).toLocaleDateString() : '-'}</td>
                    <td className="px-3 py-2 border border-gray-300 text-right font-black">R$ {r.valorTotal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="px-3 py-2 border border-gray-300 text-center font-black uppercase text-[8px]">{r.status}</td>
                  </tr>
                );
              })}
              {filteredRefs.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-10 text-center text-gray-400 border border-gray-300 italic">Sem registros para o período selecionado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-10 flex justify-end">
          <div className="w-full max-w-sm border-4 border-gray-900 p-6 rounded-2xl bg-gray-50 space-y-3">
            <div className="flex justify-between text-xs font-bold uppercase text-gray-600">
              <span>Produção Total:</span>
              <span>{totals.producao.toFixed(2)} m</span>
            </div>
            <div className="flex justify-between text-xs font-bold uppercase text-red-600">
              <span>Total Pendente:</span>
              <span>R$ {totals.pendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-xs font-bold uppercase text-green-600">
              <span>Total Liquidado:</span>
              <span>R$ {totals.liquidado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="border-t-2 border-gray-300 pt-3 flex justify-between text-lg font-black uppercase text-gray-900 tracking-tighter">
              <span>Total Geral:</span>
              <span>R$ {totals.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        <div className="mt-20 hidden print:flex justify-around items-center px-10">
          <div className="text-center w-64 border-t-2 border-gray-900 pt-3">
            <p className="text-[10px] font-black uppercase tracking-widest">Responsável Kavin's</p>
          </div>
          <div className="text-center w-64 border-t-2 border-gray-900 pt-3">
            <p className="text-[10px] font-black uppercase tracking-widest">Modelista / Conferência</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsView;
