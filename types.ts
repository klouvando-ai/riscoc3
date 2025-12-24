
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export interface User {
  username: string;
  role: UserRole;
}

export interface Modelista {
  id: string;
  nome: string;
  valorPorMetro: number;
  telefone: string;
  observacoes: string;
  status: 'ativa' | 'inativa';
}

export type RiskStatus = 'Aguardando Rolo' | 'Aguardando Risco' | 'Risco Recebido' | 'Pago';

export interface Reference {
  id: string;
  codigo: string;
  descricao: string;
  dataPedido: string; // YYYY-MM-DD
  modelistaId: string;
  observacoes: string;
  rolos: number[]; // Array dinâmico
  maiorMedida: number;
  menorMedida: number;
  status: RiskStatus;
  comprimentoRisco?: number;
  dataRecebimento?: string;
  dataPagamento?: string;
  valorTotal?: number;
}

export interface Database {
  users: User[];
  modelistas: Modelista[];
  referencias: Reference[];
}
