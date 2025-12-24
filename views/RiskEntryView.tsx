
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Reference, Modelista } from '../types';

const RiskEntryView: React.FC = () => {
  const [refs, setRefs] = useState<Reference[]>([]);
  const [modelistas, setModelistas] = useState<Modelista[]>([]);
  const [selectedRef, setSelectedRef] = useState<Reference | null>(null);
  const [finalLength, setFinalLength] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Only show pending risks
    // Fix: Corrected filter to use 'Aguardando Risco' status
    setRefs(db.getReferencias().filter(r => r.status === 'Aguardando Risco'));
    setModelistas(db.getModelistas());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRef || !finalLength) return;

    const length = Number(finalLength);
    if (isNaN(length) || length <= 0) {
      alert("Comprimento inválido.");
      return;
    }

    const modelista = modelistas.find(m => m.id === selectedRef.modelistaId);
    if (!modelista) return;

    const updatedRef: Reference = {
      ...selectedRef,
      comprimentoRisco: length,
      dataRecebimento: date,
      // Fix: Corrected status assignment to 'Risco Recebido'
      status: 'Risco Recebido',
      valorTotal: length * modelista.valorPorMetro
    };

    try {
      db.saveReferencia(updatedRef);
      alert("Entrada de risco registrada com sucesso! O comprimento agora está bloqueado.");
      setSelectedRef(null);
      setFinalLength('');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Entrada de Risco (Retorno)</h1>
        <p className="text-gray-500">Registre o comprimento final do risco devolvido pela modelista.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Riscos Pendentes</h3>
          {refs.length === 0 && <p className="text-sm text-gray-400 italic">Nenhum risco aguardando retorno.</p>}
          <div className="space-y-2">
            {refs.map(r => (
              <button
                key={r.id}
                onClick={() => setSelectedRef(r)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selectedRef?.id === r.id ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300'
                }`}
              >
                <p className="font-bold text-sm">Ref: {r.codigo}</p>
                <p className={`text-[10px] ${selectedRef?.id === r.id ? 'text-blue-100' : 'text-gray-400'}`}>
                  {modelistas.find(m => m.id === r.modelistaId)?.nome}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          {selectedRef ? (
            <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
              <div className="bg-blue-600 p-6 text-white">
                <h3 className="text-xl font-bold">Registro: {selectedRef.codigo}</h3>
                <p className="text-blue-100 text-sm">Medida Considerada: {selectedRef.maiorMedida.toFixed(2)}m</p>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Comprimento Final (m)</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        required
                        autoFocus
                        className="w-full pl-4 pr-12 py-4 bg-gray-50 border-2 border-blue-100 rounded-xl text-2xl font-black text-blue-700 outline-none focus:border-blue-500 transition-all"
                        value={finalLength}
                        onChange={(e) => setFinalLength(e.target.value)}
                        placeholder="0.00"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-blue-300">METROS</span>
                    </div>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Data de Recebimento</label>
                    <input
                      type="date"
                      required
                      className="w-full px-4 py-4 bg-gray-50 border-2 border-blue-100 rounded-xl text-lg font-bold text-gray-700 outline-none"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-yellow-800 text-xs leading-relaxed flex space-x-3">
                  <span className="text-lg">⚠️</span>
                  <span>
                    <strong>ATENÇÃO:</strong> Após salvar, o comprimento e os dados deste risco ficarão <strong>IMUTÁVEIS</strong>. 
                    Verifique os valores antes de confirmar.
                  </span>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-[0.98]"
                  >
                    Salvar e Bloquear Histórico
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center">
              <span className="text-6xl mb-4">⬅️</span>
              <h3 className="text-xl font-bold text-gray-400">Selecione uma referência ao lado</h3>
              <p className="text-gray-400 text-sm mt-2">Para registrar o retorno do risco da modelista.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiskEntryView;