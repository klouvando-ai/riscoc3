
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Modelista } from '../types';

const ModelistasView: React.FC = () => {
  const [modelistas, setModelistas] = useState<Modelista[]>([]);
  const [editing, setEditing] = useState<Modelista | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Modelista>>({
    nome: '',
    valorPorMetro: 0,
    telefone: '',
    observacoes: '',
    status: 'ativa'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setModelistas(db.getModelistas());
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const modelista: Modelista = {
      id: editing?.id || Date.now().toString(),
      nome: formData.nome || '',
      valorPorMetro: Number(formData.valorPorMetro) || 0,
      telefone: formData.telefone || '',
      observacoes: formData.observacoes || '',
      status: formData.status as 'ativa' | 'inativa' || 'ativa'
    };
    db.saveModelista(modelista);
    setIsModalOpen(false);
    setEditing(null);
    setFormData({ nome: '', valorPorMetro: 0, telefone: '', observacoes: '', status: 'ativa' });
    loadData();
  };

  const handleDelete = (id: string) => {
    try {
      if (confirm('Deseja realmente excluir esta modelista?')) {
        db.deleteModelista(id);
        loadData();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Modelistas</h1>
          <p className="text-gray-500">Gerencie as profissionais e valores por metro.</p>
        </div>
        <button
          onClick={() => { setIsModalOpen(true); setEditing(null); }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-all flex items-center space-x-2"
        >
          <span>➕</span>
          <span>Nova Modelista</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">R$ / Metro</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {modelistas.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-bold text-gray-800">{m.nome}</p>
                  <p className="text-xs text-gray-400">{m.telefone}</p>
                </td>
                <td className="px-6 py-4 font-mono text-blue-600 font-bold">
                  R$ {m.valorPorMetro.toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                    m.status === 'ativa' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {m.status}
                  </span>
                </td>
                <td className="px-6 py-4 space-x-3">
                  <button
                    onClick={() => {
                      setEditing(m);
                      setFormData(m);
                      setIsModalOpen(true);
                    }}
                    className="text-blue-500 hover:text-blue-700 text-sm font-bold"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-bold"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-blue-600 px-6 py-4 text-white">
              <h3 className="text-lg font-bold">{editing ? 'Editar Modelista' : 'Nova Modelista'}</h3>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nome Completo</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Valor p/ Metro (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.valorPorMetro}
                    onChange={(e) => setFormData({ ...formData, valorPorMetro: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
                  <select
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  >
                    <option value="ativa">Ativa</option>
                    <option value="inativa">Inativa</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Telefone</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md transition-all"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelistasView;
