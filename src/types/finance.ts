// src/types/finance.ts

export type OrigemDinheiro = 'conta_mes' | 'reserva_emergencia';

export interface Entrada {
  id: string;
  descricao: string;
  valor: number;
  fixa: boolean;
  recebido: boolean;
}

export interface SaidaDireta {
  id: string;
  descricao: string;
  valor: number;
  data: string;
  fixa: boolean;
  pago: boolean;
  origem: OrigemDinheiro;
}

export interface GastoFixoCartao {
  id: string;
  descricao: string;
  valor: number;
}

export interface Cartao {
  id: string;
  nome: string;
  cor: string;
  diaFechamento: number;
  diaVencimento: number;
  tetoMeta: number;
  gastosFixos: GastoFixoCartao[];
}

export interface FaturaMensal {
  cartaoId: string;
  mesReferencia: string; // Ex: "2026-11"
  valorAtual: number; // Atualizado toda semana
  ultimaAtualizacao: string;
  status: 'aberta' | 'fechada' | 'paga';
  origemPagamento?: OrigemDinheiro;
}

export interface Investimento {
  id: string;
  nome: string;
  categoria: 'reserva_emergencia' | 'renda_fixa' | 'bolsa_acoes' | 'bolsa_fiis';
  saldoAtual: number;
  valorInvestido: number;
  rendimentoMensalPct: number; // Ex: 0.95 (% ao mês)
}