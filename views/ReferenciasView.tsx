import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Reference, Modelista, RiskStatus } from '../types';

const ReferenciasView: React.FC = () => {
  const [refs, setRefs] = useState<Reference[]>([]);
  const [modelistas, setModelistas] = useState<Modelista[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Reference | null>(null);

  const [formData, setFormData] = useState({
    codigo: '',
    descricao: '',
    dataPedido: new Date().toISOString().split('T')[0],
    modelistaId: '',
    rolos: ['']
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setRefs(db.getReferencias());
    setModelistas(db.getModelistas().filter(m => m.status === 'ativa'));
  };

  const handleAddRolo = () => setFormData(p => ({ ...p, rolos: [...p.rolos, ''] }));
  
  const handleRemoveRolo = (idx: number) => {
    if (formData.rolos.length > 1) {
      const next = [...formData.rolos];
      next.splice(idx, 1);
      setFormData(p => ({ ...p, rolos: next }));
    }
  };

  const updateRolo = (idx: number, val: string) => {
    const next = [...formData.rolos];
    next[idx] = val;
    setFormData(p => ({ ...p, rolos: next }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    const roloValues = formData.rolos
      .map(v => parseFloat(v.toString().replace(',', '.')))
      .filter(v => !isNaN(v) && v > 0);

    const maior = roloValues.length > 0 ? Math.max(...roloValues) : 0;
    const menor = roloValues.length > 0 ? Math.min(...roloValues) : 0;
    
    let finalStatus: RiskStatus = editing?.status || (roloValues.length > 0 ? 'Aguardando Risco' : 'Aguardando Rolo');

    const reference: Reference = {
      id: editing?.id || Date.now().toString(),
      codigo: formData.codigo,
      descricao: formData.descricao,
      dataPedido: formData.dataPedido,
      modelistaId: formData.modelistaId,
      observacoes: '',
      rolos: roloValues,
      maiorMedida: maior,
      menorMedida: menor,
      status: finalStatus
    };

    try {
      db.saveReferencia(reference);
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Preferências / Riscos</h1>
          <p className="text-gray-500 text-sm">Controle de pedidos e medidas de rolos.</p>
        </div>
        <button
          onClick={() => { 
            setEditing(null); 
            setFormData({ codigo:'', descricao:'', dataPedido: new Date().toISOString().split('T')[0], modelistaId:'', rolos:[''] }); 
            setIsModalOpen(true); 
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg transition-all flex items-center space-x-2"
        >
          <span>➕</span><span>Novo Pedido</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Data</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Ref. / Descrição</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Modelista</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Medida Max.</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {refs.map(r => {
                const m = modelistas.find(mod => mod.id === r.modelistaId);
                const isLocked = r.status === 'Risco Recebido' || r.status === 'Pago';
                return (
                  <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-xs font-medium text-gray-500">{new Date(r.dataPedido).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-800">{r.codigo}</p>
                      <p className="text-[10px] text-gray-400 truncate max-w-[200px]">{r.descricao}</p>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-blue-600">{m?.nome || '-'}</td>
                    <td className="px-6 py-4 text-center font-black text-gray-800">{r.maiorMedida.toFixed(2)}m</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase inline-block min-w-[110px] ${
                        r.status === 'Pago' ? 'bg-green-100 text-green-700' : 
                        r.status === 'Risco Recebido' ? 'bg-blue-100 text-blue-700' : 
                        r.status === 'Aguardando Risco' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      {!isLocked && (
                        <button 
                          onClick={() => { 
                            setEditing(r); 
                            setFormData({ ...r, rolos: r.rolos.map(v => v.toString().replace('.', ',')) }); 
                            setIsModalOpen(true); 
                          }} 
                          className="text-blue-500 hover:text-blue-700 font-bold text-xs uppercase"
                        >
                          Editar
                        </button>
                      )}
                      {!isLocked && (
                        <button 
                          onClick={() => { if(confirm('Deseja excluir este pedido?')) { db.deleteReferencia(r.id); loadData(); } }} 
                          className="text-red-500 hover:text-red-700 font-bold text-xs uppercase"
                        >
                          Excluir
                        </button>
                      )}
                      {isLocked && <span className="text-[10px] text-gray-400 italic">Fechado</span>}
                    </td>
                  </tr>
                );
              })}
              {refs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic font-medium">Nenhum pedido registrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl my-8 overflow-hidden">
            <div className="bg-blue-600 px-8 py-5 text-white flex justify-between items-center">
              <h3 className="text-xl font-black uppercase tracking-tighter">{editing ? 'Editar Pedido' : 'Nova Referência / Pedido'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/70 hover:text-white text-xl">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Referência (Código)</label>
                  <input type="text" required className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl outline-none focus:border-blue-500 font-bold uppercase" value={formData.codigo} onChange={e => setFormData({...formData, codigo: e.target.value.toUpperCase()})} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Descrição do Produto</label>
                  <input type="text" className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl outline-none focus:border-blue-500" value={formData.descricao} onChange={e => setFormData({...formData, descricao: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Data do Pedido</label>
                  <input type="date" required className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl outline-none" value={formData.dataPedido} onChange={e => setFormData({...formData, dataPedido: e.target.value})} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Modelista Responsável</label>
                  <select required className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl outline-none font-bold text-blue-600" value={formData.modelistaId} onChange={e => setFormData({...formData, modelistaId: e.target.value})}>
                    <option value="">Selecione...</option>
                    {modelistas.map(m => <option key={m.id} value={m.id}>{m.nome} (R$ {m.valorPorMetro.toFixed(2)}/m)</option>)}
                  </select>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-sm font-black text-gray-700 uppercase tracking-widest">Medição dos Rolos (m)</h4>
                  <button type="button" onClick={handleAddRolo} className="bg-blue-600 text-white text-[10px] font-black py-2 px-4 rounded-lg uppercase shadow-sm hover:bg-blue-700 transition-all">+ Adicionar Rolo</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {formData.rolos.map((rolo, idx) => (
                    <div key={idx} className="relative group">
                      <input 
                        type="text" 
                        placeholder="0,00" 
                        className="w-full px-3 py-3 border-2 border-white rounded-xl text-center font-black text-blue-700 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" 
                        value={rolo} 
                        onChange={e => updateRolo(idx, e.target.value)} 
                      />
                      <button 
                        type="button" 
                        onClick={() => handleRemoveRolo(idx)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white w-4 h-4 rounded-full text-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                      >✕</button>
                      <label className="block text-[8px] text-center text-gray-400 uppercase mt-1.5 font-bold">Rolo {idx + 1}</label>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-gray-400 mt-6 italic">* Aceita ponto ou vírgula. A maior medida é usada para o pedido.</p>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-gray-500 font-bold uppercase text-xs">Cancelar</button>
                <button type="submit" className="px-10 py-2.5 bg-blue-600 text-white font-black rounded-xl shadow-lg hover:bg-blue-700 transition-all uppercase text-xs">Salvar Pedido</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferenciasView;