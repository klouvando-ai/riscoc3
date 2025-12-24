
import { Database, Modelista, Reference, User, UserRole } from '../types';

const DB_KEY = 'kavins_db';

const INITIAL_DB: Database = {
  users: [
    { username: 'kavins', role: UserRole.ADMIN }
  ],
  modelistas: [],
  referencias: []
};

// In a real Electron app, this would use fs.readFileSync/writeFileSync.
// Here we simulate the JSON file persistence using localStorage.
export const db = {
  get: (): Database => {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : INITIAL_DB;
  },

  save: (data: Database) => {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
  },

  getModelistas: () => db.get().modelistas,
  saveModelista: (m: Modelista) => {
    const data = db.get();
    const index = data.modelistas.findIndex(item => item.id === m.id);
    if (index >= 0) {
      data.modelistas[index] = m;
    } else {
      data.modelistas.push(m);
    }
    db.save(data);
  },
  
  deleteModelista: (id: string) => {
    const data = db.get();
    // Rule: Cannot delete if linked to risks
    const hasRisks = data.referencias.some(r => r.modelistaId === id);
    if (hasRisks) throw new Error("Não é possível apagar modelista com riscos vinculados.");
    
    data.modelistas = data.modelistas.filter(m => m.id !== id);
    db.save(data);
  },

  getReferencias: () => db.get().referencias,
  saveReferencia: (r: Reference) => {
    const data = db.get();
    const index = data.referencias.findIndex(item => item.id === r.id);
    if (index >= 0) {
      // Rule: If already received, block structural edits
      const old = data.referencias[index];
      // Fix: Corrected comparison for RiskStatus to check for initial statuses
      if ((old.status === 'Risco Recebido' || old.status === 'Pago') && (r.status === 'Aguardando Rolo' || r.status === 'Aguardando Risco')) {
        // Prevent reverting status if it was already received
        throw new Error("Não é permitido retroceder o status de um risco recebido.");
      }
      data.referencias[index] = r;
    } else {
      data.referencias.push(r);
    }
    db.save(data);
  },

  deleteReferencia: (id: string) => {
    const data = db.get();
    const ref = data.referencias.find(r => r.id === id);
    // Fix: Corrected comparison for RiskStatus to ensure only pending items can be deleted
    if (ref && (ref.status === 'Risco Recebido' || ref.status === 'Pago')) {
      throw new Error("Apenas referências em aguardando podem ser deletadas.");
    }
    data.referencias = data.referencias.filter(r => r.id !== id);
    db.save(data);
  }
};