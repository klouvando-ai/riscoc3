
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Reference, Modelista, RiskStatus } from '../types';

const ReferenciasView: React.FC = () => {
  const [refs, setRefs] = useState<Reference[]>([]);
  const [modelistas, setModelistas] = useState<Modelista[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Reference | null>(null);

  const [formData, setFormData] = useState<{
    codigo: string;
    descricao: string;
    dataPedido: string;
    modelistaId: string;
    observacoes: string;
    rolos: string[]; // Usamos string para permitir digitar vírgula
  }>({
    codigo: '',
    descricao: '',
    dataPedido: new Date().toISOString().split('T')[0],
    modelistaId: '',
    observacoes: '',
    rolos: ['']
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setRefs(db.getReferencias());
    setModelistas(db.getModelistas().filter(m => m.status === 'ativa'));
  };

  const handleAddRolo = () => {
    setFormData(prev => ({ ...prev, rolos: [...prev.rolos, ''] }));
  };

  const handleRemoveRolo = (index: number) => {
    if (formData.rolos.length <= 1) return;
    const newRolos = [...formData.rolos];
    newRolos.splice(index, 1);
    setFormData(prev => ({ ...prev, rolos: newRolos }));
  };

  const updateRoloValue = (index: number, val: string) => {
    const newRolos = [...formData.rolos];
    // Substitui vírgula por ponto em tempo real para visualização se desejar, 
    // ou apenas mantém para converter no save. Aqui permitimos a vírgula.
    newRolos[index] = val;
    setFormData(prev => ({ ...prev, rolos: newRolos }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Converte vírgula para ponto e filtra valores vazios
    const roloValues = formData.rolos
      .map(v => parseFloat(v.toString().replace(',', '.')))
      .filter(v => !isNaN(v) && v > 0);

    const maior = roloValues.length > 0 ? Math.max(...roloValues) : 0;
    const menor = roloValues.length > 0 ? Math.min(...roloValues) : 0;

    // Se tem rolo, vai para 'Aguardando Risco', senão 'Aguardando Rolo'
    let finalStatus: RiskStatus = editing?.status || 'Aguardando Rolo';
    if (finalStatus === 'Aguardando Rolo' && roloValues.length > 0) {
      finalStatus = 'Aguardando Risco';
    }

    const reference: Reference = {
      id: editing?.id || Date.now().toString(),
      codigo: formData.codigo,
      descricao: formData.descricao,
      dataPedido: formData.dataPedido,
      modelistaId: formData.modelistaId,
      observacoes: formData.observacoes,
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
          <p className="text-gray-500">Gestão de referências e pedidos de risco.</p>
        </div>
        <button
          onClick={() => { 
            setEditing(null); 
            setFormData({ 
              codigo: '', descricao: '', dataPedido: new Date().toISOString().split('T')[0],
              modelistaId: '', observacoes: '', rolos: [''] 
            });
            setIsModalOpen(true); 
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-all flex items-center space-x-2"
        >
          <span>➕</span>
          <span>Adicionar Referência</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase">Data</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase">Ref. / Descrição</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase">Modelista</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase text-center">Medida Max.</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase text-center">Status</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {refs.map(r => {
              const m = modelistas.find(mod => mod.id === r.modelistaId);
              const isLocked = r.status === 'Risco Recebido' || r.status === 'Pago';
              return (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-600">{new Date(r.dataPedido).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-800">{r.codigo}</p>
                    <p className="text-[10px] text-gray-400 truncate max-w-xs">{r.descricao}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 font-semibold">{m?.nome || '-'}</td>
                  <td className="px-6 py-4 text-center font-black text-blue-600">{r.maiorMedida > 0 ? `${r.maiorMedida.toFixed(2)}m` : '-'}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded text-[9px] font-black uppercase inline-block min-w-[100px] ${
                      r.status === 'Pago' ? 'bg-green-100 text-green-700' : 
                      r.status === 'Risco Recebido' ? 'bg-blue-100 text-blue-700' : 
                      r.status === 'Aguardando Risco' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    {!isLocked && (
                      <>
                        <button
                          onClick={() => { 
                            setEditing(r); 
                            setFormData({
                              ...r,
                              rolos: r.rolos.map(v => v.toString().replace('.', ','))
                            }); 
                            setIsModalOpen(true); 
                          }}
                          className="text-blue-500 hover:text-blue-700 font-bold text-xs"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => { if(confirm('Excluir?')) db.deleteReferencia(r.id); loadData(); }}
                          className="text-red-500 hover:text-red-700 font-bold text-xs"
                        >
                          Excluir
                        </button>
                      </>
                    )}
                    {isLocked && <span className="text-[10px] text-gray-400 italic">Fechado</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8 overflow-hidden">
            <div className="bg-blue-600 px-6 py-4 text-white flex justify-between items-center">
              <h3 className="text-lg font-bold">{editing ? 'Editar Pedido' : 'Novo Pedido de Risco'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/70 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Referência</label>
                  <input
                    type="text" required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Descrição do Produto</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Data Pedido</label>
                  <input
                    type="date" required
                    className="w-full px-4 py-2 border rounded-lg outline-none"
                    value={formData.dataPedido}
                    onChange={(e) => setFormData({ ...formData, dataPedido: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Modelista</label>
                  <select
                    required
                    className="w-full px-4 py-2 border rounded-lg outline-none font-bold"
                    value={formData.modelistaId}
                    onChange={(e) => setFormData({ ...formData, modelistaId: e.target.value })}
                  >
                    <option value="">Selecione...</option>
                    {modelistas.map(m => (
                      <option key={m.id} value={m.id}>{m.nome} (R$ {m.valorPorMetro.toFixed(2)}/m)</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-black text-gray-700 uppercase tracking-widest">Medidas dos Rolos</h4>
                  <button 
                    type="button" 
                    onClick={handleAddRolo}
                    className="bg-blue-600 text-white text-xs font-bold py-1 px-3 rounded-full hover:bg-blue-700 transition-colors"
                  >
                    + Adicionar Rolo
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {formData.rolos.map((rolo, idx) => (
                    <div key={idx} className="relative group">
                      <input
                        type="text"
                        placeholder="0,00"
                        className="w-full px-3 py-2 border rounded-lg text-center font-bold text-blue-700 outline-none focus:border-blue-500 bg-white"
                        value={rolo}
                        onChange={(e) => updateRoloValue(idx, e.target.value)}
                      />
                      <button 
                        type="button"
                        onClick={() => handleRemoveRolo(idx)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white w-4 h-4 rounded-full text-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >✕</button>
                      <label className="block text-[8px] text-center text-gray-400 uppercase mt-1">Rolo {idx + 1}</label>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-gray-400 mt-4 italic">Aceita ponto (.) ou vírgula (,)</p>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-gray-500 font-bold">Cancelar</button>
                <button type="submit" className="px-8 py-2 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all">Salvar Registro</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferenciasView;
