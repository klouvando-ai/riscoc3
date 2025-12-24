
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

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8 no-print">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Relatórios</h1>
          <p className="text-gray-500">Consolidado de produção e histórico.</p>
        </div>
        <button
          onClick={() => window.print()}
          className="bg-gray-900 hover:bg-black text-white font-bold py-2 px-6 rounded-lg shadow-md transition-all flex items-center space-x-2"
        >
          <span>🖨️</span>
          <span>Imprimir Relatório</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8 no-print grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Início</label>
          <input type="date" className="w-full px-3 py-2 border rounded-lg outline-none text-sm" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Fim</label>
          <input type="date" className="w-full px-3 py-2 border rounded-lg outline-none text-sm" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Modelista</label>
          <select className="w-full px-3 py-2 border rounded-lg outline-none text-sm" value={filterModelista} onChange={e => setFilterModelista(e.target.value)}>
            <option value="">Todas</option>
            {modelistas.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
          </select>
        </div>
        <div className="flex space-x-2">
          <button onClick={() => { setStartDate(''); setEndDate(''); setFilterModelista(''); }} className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-bold uppercase transition-all">Limpar</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 no-print">
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <p className="text-[10px] font-bold text-blue-400 uppercase">Produção Total</p>
          <p className="text-xl font-black text-blue-700">{totals.producao.toFixed(2)}m</p>
        </div>
        <div className="bg-green-50 p-4 rounded-xl border border-green-100">
          <p className="text-[10px] font-bold text-green-400 uppercase">Total Liquidado</p>
          <p className="text-xl font-black text-green-700">R$ {totals.liquidado.toFixed(2)}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-xl border border-red-100">
          <p className="text-[10px] font-bold text-red-400 uppercase">Total Pendente</p>
          <p className="text-xl font-black text-red-700">R$ {totals.pendente.toFixed(2)}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Valor Bruto</p>
          <p className="text-xl font-black text-gray-700">R$ {totals.valorTotal.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 print:shadow-none print:border-none print:p-0">
        <div className="text-center mb-10 pb-6 border-b-2 border-gray-900">
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter">KAVIN'S - RELATÓRIO DE RISCOS</h2>
          <div className="flex justify-center space-x-4 mt-2 text-[10px] font-bold uppercase text-gray-500">
            <span>Período: {startDate || 'Sempre'} até {endDate || 'Hoje'}</span>
            <span>•</span>
            <span>Filtro Modelista: {modelistas.find(m => m.id === filterModelista)?.nome || 'Todas'}</span>
          </div>
          <p className="text-gray-400 text-[8px] mt-2 italic uppercase">Impressão realizada em {new Date().toLocaleString('pt-BR')}</p>
        </div>

        <table className="w-full text-[10px] border-collapse">
          <thead>
            <tr className="bg-gray-900 text-white">
              <th className="px-2 py-2 border border-black text-left">Data Ped.</th>
              <th className="px-2 py-2 border border-black text-left">Referência</th>
              <th className="px-2 py-2 border border-black text-center">Rolo Máx.</th>
              <th className="px-2 py-2 border border-black text-center">Rolo Mín.</th>
              <th className="px-2 py-2 border border-black text-left">Modelista</th>
              <th className="px-2 py-2 border border-black text-center">Compr. Risco</th>
              <th className="px-2 py-2 border border-black text-center">Recebimento</th>
              <th className="px-2 py-2 border border-black text-right">Valor Total</th>
              <th className="px-2 py-2 border border-black text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredRefs.map(r => {
              const m = modelistas.find(mod => mod.id === r.modelistaId);
              return (
                <tr key={r.id} className="odd:bg-white even:bg-gray-50">
                  <td className="px-2 py-2 border border-gray-300">{new Date(r.dataPedido).toLocaleDateString()}</td>
                  <td className="px-2 py-2 border border-gray-300 font-bold">{r.codigo}</td>
                  <td className="px-2 py-2 border border-gray-300 text-center">{r.maiorMedida.toFixed(2)}m</td>
                  <td className="px-2 py-2 border border-gray-300 text-center">{r.menorMedida.toFixed(2)}m</td>
                  <td className="px-2 py-2 border border-gray-300 truncate max-w-[100px]">{m?.nome || '-'}</td>
                  <td className="px-2 py-2 border border-gray-300 text-center font-bold">{r.comprimentoRisco ? `${r.comprimentoRisco.toFixed(2)}m` : '-'}</td>
                  <td className="px-2 py-2 border border-gray-300 text-center">{r.dataRecebimento ? new Date(r.dataRecebimento).toLocaleDateString() : '-'}</td>
                  <td className="px-2 py-2 border border-gray-300 text-right font-black">R$ {r.valorTotal?.toFixed(2) || '0.00'}</td>
                  <td className="px-2 py-2 border border-gray-300 text-center uppercase text-[8px] font-bold">{r.status}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="mt-8 flex justify-end">
          <div className="w-full max-w-xs space-y-2 border-2 border-gray-900 p-4 rounded-lg bg-gray-50">
            <div className="flex justify-between text-xs"><span className="font-bold">Total Produzido:</span><span>{totals.producao.toFixed(2)}m</span></div>
            <div className="flex justify-between text-xs text-red-600"><span className="font-bold">Total Pendente:</span><span>R$ {totals.pendente.toFixed(2)}</span></div>
            <div className="flex justify-between text-xs text-green-600"><span className="font-bold">Total Liquidado:</span><span>R$ {totals.liquidado.toFixed(2)}</span></div>
            <div className="border-t border-gray-400 pt-2 flex justify-between text-sm font-black uppercase"><span className="text-gray-900">Total Geral:</span><span>R$ {totals.valorTotal.toFixed(2)}</span></div>
          </div>
        </div>

        <div className="mt-16 flex justify-around px-10 no-print print:flex">
          <div className="text-center w-48 border-t border-black pt-2">
            <p className="text-[8px] font-black uppercase">Diretoria Kavin's</p>
          </div>
          <div className="text-center w-48 border-t border-black pt-2">
            <p className="text-[8px] font-black uppercase">Responsável Corte</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsView;
