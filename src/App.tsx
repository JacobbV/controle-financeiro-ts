// src/App.tsx
import { useState, useEffect } from 'react';
import {
  Wallet,
  CreditCard,
  TrendingUp,
  ArrowUpCircle,
  ArrowDownCircle,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Trash2,
  ShieldAlert,
  LogOut,
  Edit2,
} from 'lucide-react';
import { signInWithPopup, signOut, onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db, EMAILS_AUTORIZADOS } from './firebase';
import type {
  Cartao,
  Entrada,
  FaturaMensal,
  Investimento,
  OrigemDinheiro,
  SaidaDireta,
} from './types/finance';
import './App.css';

const formatBRL = (val: number) =>
  val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState('');

  const [abaAtiva, setAbaAtiva] = useState<'painel' | 'fluxo' | 'investimentos'>('painel');
  const [mesAtual, setMesAtual] = useState('2026-11');

  // Estados principais
  const [entradas, setEntradas] = useState<Entrada[]>([]);
  const [cartoes, setCartoes] = useState<Cartao[]>([]);
  const [faturas, setFaturas] = useState<FaturaMensal[]>([]);
  const [saidasDiretas, setSaidasDiretas] = useState<SaidaDireta[]>([]);
  const [investimentos, setInvestimentos] = useState<Investimento[]>([]);

  // Modais de Cartão
  const [modalCartaoAberto, setModalCartaoAberto] = useState(false);
  const [cartaoEditandoId, setCartaoEditandoId] = useState<string | null>(null);
  const [novoCartaoNome, setNovoCartaoNome] = useState('');
  const [novoCartaoCor, setNovoCartaoCor] = useState('#60a5fa');
  const [novoCartaoFechamento, setNovoCartaoFechamento] = useState('25');
  const [novoCartaoVencimento, setNovoCartaoVencimento] = useState('5');
  const [novoCartaoTeto, setNovoCartaoTeto] = useState('2000');

  // Modal de Reserva
  const [modalReservaAberto, setModalReservaAberto] = useState(false);
  const [novaReservaNome, setNovaReservaNome] = useState('');
  const [novaReservaSaldo, setNovaReservaSaldo] = useState('');
  const [novaReservaCdi, setNovaReservaCdi] = useState('120');

  // Inputs rápidos
  const [novaSaidaDesc, setNovaSaidaDesc] = useState('');
  const [novaSaidaValor, setNovaSaidaValor] = useState('');
  const [novaSaidaOrigem, setNovaSaidaOrigem] = useState<OrigemDinheiro>('conta_mes');
  const [novaSaidaFixa, setNovaSaidaFixa] = useState(false);

  const [novaEntradaDesc, setNovaEntradaDesc] = useState('');
  const [novaEntradaValor, setNovaEntradaValor] = useState('');

  // 1. Vigiar Autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser && currentUser.email) {
        if (!EMAILS_AUTORIZADOS.includes(currentUser.email)) {
          setAuthError(`O e-mail ${currentUser.email} não tem permissão de acesso.`);
          await signOut(auth);
          setUser(null);
        } else {
          setAuthError('');
          setUser(currentUser);
          await carregarDadosNuvem(currentUser.uid);
        }
      } else {
        setUser(null);
      }
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Carregar do Firestore (ou criar dados iniciais de Novembro se estiver vazio)
  const carregarDadosNuvem = async (uid: string) => {
    try {
      const docRef = doc(db, 'usuarios', uid);
      const snap = await getDoc(docRef);
      if (snap.exists() && snap.data().cartoes?.length > 0) {
        const dados = snap.data();
        setEntradas(dados.entradas || []);
        setCartoes(dados.cartoes || []);
        setFaturas(dados.faturas || []);
        setSaidasDiretas(dados.saidasDiretas || []);
        setInvestimentos(dados.investimentos || []);
      } else {
        // Dados padrão reais de Novembro que você enviou nos prints
        const padraoCartoes = [
          { id: 'bb', nome: 'Cartão BB', cor: '#facc15', diaFechamento: 24, diaVencimento: 4, tetoMeta: 4647.28, gastosFixos: [] },
          { id: 'inter', nome: 'Cartão Inter', cor: '#f97316', diaFechamento: 31, diaVencimento: 7, tetoMeta: 2700.02, gastosFixos: [] },
          { id: 'nu', nome: 'Cartão NU', cor: '#a855f7', diaFechamento: 18, diaVencimento: 25, tetoMeta: 200, gastosFixos: [] },
          { id: 'neon', nome: 'Cartão Neon', cor: '#06b6d4', diaFechamento: 30, diaVencimento: 5, tetoMeta: 350, gastosFixos: [] },
        ];
        const padraoEntradas = [
          { id: '1', descricao: 'Salário IFPB', valor: 4897.63, fixa: true, recebido: true },
          { id: '2', descricao: 'Fatura - Beatriz', valor: 448.37, fixa: false, recebido: true },
          { id: '3', descricao: 'Fatura - Ana Maria', valor: 56.67, fixa: false, recebido: true },
          { id: '4', descricao: 'Fatura - Mercia', valor: 80.00, fixa: false, recebido: true },
          { id: '5', descricao: 'Fatura - Rosangela', valor: 171.25, fixa: false, recebido: true },
        ];
        const padraoInvestimentos = [
          { id: 'inv1', nome: 'Caixinha Mercado Pago (140% CDI)', categoria: 'reserva_emergencia' as const, saldoAtual: 5000, valorInvestido: 4800, rendimentoMensalPct: 1.15 },
          { id: 'inv2', nome: 'Caixinha Mercado Pago (120% CDI)', categoria: 'reserva_emergencia' as const, saldoAtual: 3000, valorInvestido: 2900, rendimentoMensalPct: 0.98 },
        ];
        
        setCartoes(padraoCartoes);
        setEntradas(padraoEntradas);
        setInvestimentos(padraoInvestimentos);
        await setDoc(docRef, { entradas: padraoEntradas, cartoes: padraoCartoes, faturas: [], saidasDiretas: [], investimentos: padraoInvestimentos });
      }
    } catch (err) {
      console.error('Erro ao carregar:', err);
    }
  };

  // 3. Salvar Automaticamente na Nuvem
  useEffect(() => {
    if (!user) return;
    const salvarNuvem = async () => {
      try {
        const docRef = doc(db, 'usuarios', user.uid);
        await setDoc(docRef, { entradas, cartoes, faturas, saidasDiretas, investimentos }, { merge: true });
      } catch (err) {
        console.error('Erro ao salvar:', err);
      }
    };
    salvarNuvem();
  }, [entradas, cartoes, faturas, saidasDiretas, investimentos, user]);

  const handleLoginGoogle = async () => {
    try {
      setAuthError('');
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      setAuthError('Erro ao entrar com Google: ' + err.message);
    }
  };

  const handleLogout = () => signOut(auth);

  // CÁLCULOS
  const totalEntradas = entradas.reduce((acc, e) => acc + e.valor, 0);

  const faturasDoMes = cartoes.map((cartao) => {
    const faturaExistente = faturas.find((f) => f.cartaoId === cartao.id && f.mesReferencia === mesAtual);
    const pisoFixo = cartao.gastosFixos ? cartao.gastosFixos.reduce((s, g) => s + g.valor, 0) : 0;
    return (
      faturaExistente || {
        cartaoId: cartao.id,
        mesReferencia: mesAtual,
        valorAtual: pisoFixo,
        ultimaAtualizacao: 'Piso automático',
        status: 'aberta' as const,
      }
    );
  });

  const totalFaturasCartoes = faturasDoMes.reduce((acc, f) => acc + f.valorAtual, 0);
  const saidasContaMes = saidasDiretas.filter((s) => s.origem === 'conta_mes').reduce((acc, s) => acc + s.valor, 0);
  const totalSaidasGiroMes = totalFaturasCartoes + saidasContaMes;
  const saldoProjetadoMes = totalEntradas - totalSaidasGiroMes;
  const temRombo = saldoProjetadoMes < 0;
  const valorRombo = Math.abs(saldoProjetadoMes);

  const saldoTotalReservas = investimentos.reduce((acc, inv) => acc + inv.saldoAtual, 0);

  // AÇÕES DE CARTÃO
  const abrirModalNovoCartao = () => {
    setCartaoEditandoId(null);
    setNovoCartaoNome('');
    setNovoCartaoCor('#60a5fa');
    setNovoCartaoFechamento('25');
    setNovoCartaoVencimento('5');
    setNovoCartaoTeto('2000');
    setModalCartaoAberto(true);
  };

  const abrirModalEditarCartao = (cartao: Cartao) => {
    setCartaoEditandoId(cartao.id);
    setNovoCartaoNome(cartao.nome);
    setNovoCartaoCor(cartao.cor || '#60a5fa');
    setNovoCartaoFechamento(String(cartao.diaFechamento));
    setNovoCartaoVencimento(String(cartao.diaVencimento));
    setNovoCartaoTeto(String(cartao.tetoMeta));
    setModalCartaoAberto(true);
  };

  const salvarCartaoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoCartaoNome) return;

    if (cartaoEditandoId) {
      setCartoes((prev) =>
        prev.map((c) =>
          c.id === cartaoEditandoId
            ? {
                ...c,
                nome: novoCartaoNome,
                cor: novoCartaoCor,
                diaFechamento: parseInt(novoCartaoFechamento) || 25,
                diaVencimento: parseInt(novoCartaoVencimento) || 5,
                tetoMeta: parseFloat(novoCartaoTeto) || 2000,
              }
            : c
        )
      );
    } else {
      const novo: Cartao = {
        id: String(Date.now()),
        nome: novoCartaoNome,
        cor: novoCartaoCor,
        diaFechamento: parseInt(novoCartaoFechamento) || 25,
        diaVencimento: parseInt(novoCartaoVencimento) || 5,
        tetoMeta: parseFloat(novoCartaoTeto) || 2000,
        gastosFixos: [],
      };
      setCartoes((prev) => [...prev, novo]);
    }
    setModalCartaoAberto(false);
  };

  const excluirCartao = (id: string) => {
    if (confirm('Deseja realmente remover este cartão?')) {
      setCartoes((prev) => prev.filter((c) => c.id !== id));
    }
  };

  // AÇÕES DE RESERVA
  const adicionarReservaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const saldo = parseFloat(novaReservaSaldo.replace(',', '.')) || 0;
    const cdiPct = parseFloat(novaReservaCdi.replace(',', '.')) || 100;
    if (!novaReservaNome) return;

    const novaReserva: Investimento = {
      id: String(Date.now()),
      nome: novaReservaNome,
      categoria: 'reserva_emergencia',
      saldoAtual: saldo,
      valorInvestido: saldo,
      rendimentoMensalPct: Number((cdiPct * 0.008).toFixed(2)),
    };

    setInvestimentos((prev) => [...prev, novaReserva]);
    setNovaReservaNome('');
    setNovaReservaSaldo('');
    setModalReservaAberto(false);
  };

  const excluirReserva = (id: string) => {
    setInvestimentos((prev) => prev.filter((i) => i.id !== id));
  };

  const cobrirRomboComReserva = () => {
    if (!temRombo || valorRombo <= 0) return;
    if (saldoTotalReservas < valorRombo) {
      alert('O saldo total das suas reservas é menor que o rombo!');
      return;
    }

    let restante = valorRombo;
    setInvestimentos((prev) =>
      prev.map((inv) => {
        if (restante <= 0 || inv.saldoAtual <= 0) return inv;
        const deduzir = Math.min(inv.saldoAtual, restante);
        restante -= deduzir;
        return { ...inv, saldoAtual: inv.saldoAtual - deduzir };
      })
    );

    setEntradas((prev) => [
      ...prev,
      { id: String(Date.now()), descricao: 'Resgate Cobertura de Rombo', valor: valorRombo, fixa: false, recebido: true },
    ]);
  };

  const atualizarValorFatura = (cartaoId: string, novoValorStr: string) => {
    const valor = parseFloat(novoValorStr.replace(',', '.')) || 0;
    const hoje = new Date().toLocaleDateString('pt-BR');
    setFaturas((prev) => {
      const idx = prev.findIndex((f) => f.cartaoId === cartaoId && f.mesReferencia === mesAtual);
      if (idx >= 0) {
        const copia = [...prev];
        copia[idx] = { ...copia[idx], valorAtual: valor, ultimaAtualizacao: `Atualizado em ${hoje}` };
        return copia;
      }
      return [...prev, { cartaoId, mesReferencia: mesAtual, valorAtual: valor, ultimaAtualizacao: `Atualizado em ${hoje}`, status: 'aberta' }];
    });
  };

  const alternarPagamentoFatura = (cartaoId: string) => {
    setFaturas((prev) => {
      const idx = prev.findIndex((f) => f.cartaoId === cartaoId && f.mesReferencia === mesAtual);
      if (idx >= 0) {
        const copia = [...prev];
        const novoStatus = copia[idx].status === 'paga' ? 'aberta' : 'paga';
        copia[idx] = { ...copia[idx], status: novoStatus };
        return copia;
      }
      return [...prev, { cartaoId, mesReferencia: mesAtual, valorAtual: 0, ultimaAtualizacao: 'Paga', status: 'paga' }];
    });
  };

  const adicionarSaidaRapida = (e: React.FormEvent) => {
    e.preventDefault();
    const valor = parseFloat(novaSaidaValor.replace(',', '.'));
    if (!novaSaidaDesc || isNaN(valor) || valor <= 0) return;

    const nova: SaidaDireta = {
      id: String(Date.now()),
      descricao: novaSaidaDesc,
      valor,
      data: new Date().toLocaleDateString('pt-BR'),
      fixa: novaSaidaFixa,
      pago: true,
      origem: novaSaidaOrigem,
    };

    setSaidasDiretas((prev) => [nova, ...prev]);
    if (novaSaidaOrigem === 'reserva_emergencia' && investimentos.length > 0) {
      setInvestimentos((prev) =>
        prev.map((inv, idx) => (idx === 0 ? { ...inv, saldoAtual: Math.max(0, inv.saldoAtual - valor) } : inv))
      );
    }
    setNovaSaidaDesc('');
    setNovaSaidaValor('');
  };

  const adicionarEntrada = (e: React.FormEvent) => {
    e.preventDefault();
    const valor = parseFloat(novaEntradaValor.replace(',', '.'));
    if (!novaEntradaDesc || isNaN(valor) || valor <= 0) return;
    setEntradas((prev) => [...prev, { id: String(Date.now()), descricao: novaEntradaDesc, valor, fixa: false, recebido: true }]);
    setNovaEntradaDesc('');
    setNovaEntradaValor('');
  };

  if (loadingAuth) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--cf-muted)' }}>A carregar...</div>;
  }

  if (!user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', padding: '1rem' }}>
        <div className="cf-card" style={{ width: '100%', maxWidth: '420px', textAlign: 'center', padding: '2.5rem 2rem' }}>
          <div className="cf-logo-mark" style={{ margin: '0 auto 1.25rem', width: '64px', height: '64px' }}>
            <Wallet size={32} />
          </div>
          <h2 style={{ marginBottom: '0.4rem', fontSize: '1.4rem' }}>Controle Financeiro TS</h2>
          <p style={{ color: 'var(--cf-muted)', fontSize: '0.86rem', marginBottom: '1.8rem' }}>
            Gerencie suas faturas, entradas e investimentos com segurança na nuvem.
          </p>

          {authError && (
            <div style={{ background: 'rgba(248, 113, 113, 0.15)', border: '1px solid #f87171', color: '#f87171', padding: '0.75rem', borderRadius: '10px', fontSize: '0.84rem', marginBottom: '1.2rem' }}>
              {authError}
            </div>
          )}

          <button onClick={handleLoginGoogle} className="cf-btn-google">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.13 0-5.78-2.11-6.73-4.96H1.18v3.15C3.15 21.32 7.22 24 12 24z"/>
              <path fill="#FBBC05" d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.18C.43 8.12 0 9.81 0 12s.43 3.88 1.18 5.39l4.09-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.22 0 3.15 2.68 1.18 6.61l4.09 3.15c.95-2.85 3.6-4.96 6.73-4.96z"/>
            </svg>
            Entrar com o Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cf-container">
      {/* TOPO */}
      <header className="cf-header">
        <div className="cf-brand">
          <div className="cf-logo-mark">
            <Wallet size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--cf-muted)', letterSpacing: '0.08em' }}>
              V2.1.0 — CLOUD FIREBASE
            </div>
            <h1 style={{ margin: 0, fontSize: '1.25rem' }}>Controle Financeiro TS</h1>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--cf-muted)' }}>Mês:</span>
            <input
              type="month"
              value={mesAtual}
              onChange={(e) => setMesAtual(e.target.value)}
              className="cf-input"
              style={{ width: 'auto' }}
            />
          </div>
          <button onClick={handleLogout} className="cf-btn cf-btn-ghost" title="Sair do Sistema">
            <LogOut size={16} /> Sair
          </button>
        </div>
      </header>

      {/* ALERTA DE ROMBO */}
      {temRombo && (
        <div className="cf-alert-rombo">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <AlertTriangle size={28} color="#f87171" />
            <div>
              <strong style={{ color: '#f87171', fontSize: '1rem' }}>
                Atenção: Suas saídas superaram as entradas em {formatBRL(valorRombo)} neste mês!
              </strong>
              <div style={{ fontSize: '0.86rem', color: 'var(--cf-muted)', marginTop: '0.2rem' }}>
                Total de Reservas disponíveis: <strong>{formatBRL(saldoTotalReservas)}</strong>.
              </div>
            </div>
          </div>
          <button className="cf-btn cf-btn-danger" onClick={cobrirRomboComReserva}>
            <ShieldAlert size={16} /> Cobrir com Reserva
          </button>
        </div>
      )}

      {/* CARDS DE RESUMO */}
      <section className="cf-grid-4">
        <div className="cf-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--cf-muted)', fontSize: '0.85rem' }}>Entradas do Mês</span>
            <span className="badge kind-entrada"><ArrowUpCircle size={14} /> Receitas</span>
          </div>
          <h2 style={{ margin: '0.6rem 0 0.2rem', fontSize: '1.6rem', color: '#4ade80' }}>
            {formatBRL(totalEntradas)}
          </h2>
          <small style={{ color: 'var(--cf-muted)' }}>{entradas.length} fonte(s)</small>
        </div>

        <div className="cf-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--cf-muted)', fontSize: '0.85rem' }}>Saídas Totais (Giro)</span>
            <span className="badge kind-saida"><ArrowDownCircle size={14} /> Giro</span>
          </div>
          <h2 style={{ margin: '0.6rem 0 0.2rem', fontSize: '1.6rem', color: '#f87171' }}>
            {formatBRL(totalSaidasGiroMes)}
          </h2>
          <small style={{ color: 'var(--cf-muted)' }}>Cartões + PIX/Fixas</small>
        </div>

        <div className="cf-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--cf-muted)', fontSize: '0.85rem' }}>Balanço Livre</span>
            <span className={`badge ${temRombo ? 'kind-saida' : 'kind-entrada'}`}>
              {temRombo ? 'No Sufoco' : 'No Azul'}
            </span>
          </div>
          <h2 style={{ margin: '0.6rem 0 0.2rem', fontSize: '1.6rem', color: temRombo ? '#f87171' : '#4ade80' }}>
            {formatBRL(saldoProjetadoMes)}
          </h2>
          <small style={{ color: 'var(--cf-muted)' }}>{temRombo ? 'Requer atenção' : 'Sobra no mês'}</small>
        </div>

        <div className="cf-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--cf-muted)', fontSize: '0.85rem' }}>Total em Reservas</span>
            <span className="badge kind-reserva">Proteção</span>
          </div>
          <h2 style={{ margin: '0.6rem 0 0.2rem', fontSize: '1.6rem', color: '#60a5fa' }}>
            {formatBRL(saldoTotalReservas)}
          </h2>
          <small style={{ color: 'var(--cf-muted)' }}>{investimentos.length} caixinha(s)</small>
        </div>
      </section>

      {/* ABA 1: CARTÕES */}
      {abaAtiva === 'painel' && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem', flexWrap: 'wrap', gap: '0.7rem' }}>
            <div>
              <h3 style={{ margin: 0 }}>Faturas dos Cartões</h3>
              <small style={{ color: 'var(--cf-muted)' }}>Atualize semanalmente o valor da fatura de cada cartão.</small>
            </div>
            <button className="cf-btn cf-btn-primary" onClick={abrirModalNovoCartao}>
              <Plus size={16} /> Adicionar Novo Cartão
            </button>
          </div>

          <div className="cf-grid-2">
            {cartoes.map((cartao) => {
              const fatura = faturasDoMes.find((f) => f.cartaoId === cartao.id)!;
              const pctTeto = cartao.tetoMeta > 0 ? Math.min(100, Math.round((fatura.valorAtual / cartao.tetoMeta) * 100)) : 0;
              const isPaga = fatura.status === 'paga';

              return (
                <div
                  key={cartao.id}
                  className={`cf-card ${isPaga ? 'cf-card-paid' : ''}`}
                  style={{ borderTop: `3px solid ${isPaga ? '#4ade80' : cartao.cor}` }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{cartao.nome}</h4>
                      <small style={{ color: 'var(--cf-muted)' }}>
                        Fecha dia {cartao.diaFechamento} • Vence dia {cartao.diaVencimento}
                      </small>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span className={`badge ${isPaga ? 'kind-entrada' : 'kind-saida'}`}>
                        {isPaga ? 'PAGA ✓' : 'A PAGAR'}
                      </span>
                      <button
                        className="cf-btn cf-btn-ghost"
                        style={{ padding: '0.25rem 0.4rem' }}
                        onClick={() => abrirModalEditarCartao(cartao)}
                        title="Editar Cartão"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        className="cf-btn cf-btn-ghost"
                        style={{ padding: '0.25rem 0.4rem' }}
                        onClick={() => excluirCartao(cartao.id)}
                        title="Excluir Cartão"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div style={{ marginTop: '1rem' }}>
                    <label style={{ fontSize: '0.78rem', color: 'var(--cf-muted)' }}>Valor atual da fatura (R$):</label>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem' }}>
                      <input
                        type="number"
                        step="0.01"
                        className="cf-input"
                        value={fatura.valorAtual}
                        onChange={(e) => atualizarValorFatura(cartao.id, e.target.value)}
                        style={{ fontSize: '1.15rem', fontWeight: 700 }}
                      />
                      <button
                        type="button"
                        className={`cf-btn ${isPaga ? 'cf-btn-ghost' : 'cf-btn-success'}`}
                        onClick={() => alternarPagamentoFatura(cartao.id)}
                      >
                        <CheckCircle2 size={16} />
                        {isPaga ? 'Reabrir' : 'Pagar'}
                      </button>
                    </div>
                    <small style={{ color: 'var(--cf-muted)', fontSize: '0.75rem' }}>{fatura.ultimaAtualizacao}</small>
                  </div>

                  <div style={{ marginTop: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--cf-muted)' }}>
                      <span>Teto: {formatBRL(cartao.tetoMeta)}</span>
                      <span>{pctTeto}%</span>
                    </div>
                    <div className="cf-progress-bg">
                      <div
                        className="cf-progress-bar"
                        style={{
                          width: `${pctTeto}%`,
                          background: fatura.valorAtual > cartao.tetoMeta ? '#f87171' : isPaga ? '#4ade80' : cartao.cor,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {modalCartaoAberto && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100, padding: '1rem' }}>
              <div className="cf-card" style={{ width: '100%', maxWidth: '440px', background: '#111827' }}>
                <h3 style={{ marginTop: 0 }}>{cartaoEditandoId ? 'Editar Cartão' : 'Adicionar Novo Cartão'}</h3>
                <form onSubmit={salvarCartaoSubmit} style={{ display: 'grid', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--cf-muted)' }}>Nome do Cartão:</label>
                    <input type="text" placeholder="Ex: Cartão BB, Nubank..." className="cf-input" value={novoCartaoNome} onChange={(e) => setNovoCartaoNome(e.target.value)} required />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--cf-muted)' }}>Dia Fechamento:</label>
                      <input type="number" className="cf-input" value={novoCartaoFechamento} onChange={(e) => setNovoCartaoFechamento(e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--cf-muted)' }}>Dia Vencimento:</label>
                      <input type="number" className="cf-input" value={novoCartaoVencimento} onChange={(e) => setNovoCartaoVencimento(e.target.value)} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--cf-muted)' }}>Teto/Meta (R$):</label>
                      <input type="number" step="0.01" className="cf-input" value={novoCartaoTeto} onChange={(e) => setNovoCartaoTeto(e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: 'var(--cf-muted)' }}>Cor do Cartão:</label>
                      <input type="color" className="cf-input" style={{ height: '38px', padding: '2px' }} value={novoCartaoCor} onChange={(e) => setNovoCartaoCor(e.target.value)} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button type="button" className="cf-btn cf-btn-ghost" onClick={() => setModalCartaoAberto(false)}>Cancelar</button>
                    <button type="submit" className="cf-btn cf-btn-primary">Salvar Cartão</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ABA 2: ENTRADAS E PIX */}
      {abaAtiva === 'fluxo' && (
        <section className="cf-grid-2">
          <div className="cf-card">
            <h3 style={{ marginTop: 0 }}>Lançar Saída (PIX / Contas Fixas)</h3>
            <form onSubmit={adicionarSaidaRapida} style={{ display: 'grid', gap: '0.7rem' }}>
              <input
                type="text"
                placeholder="Ex: Internet Brisanet, PIX Aluguel..."
                className="cf-input"
                value={novaSaidaDesc}
                onChange={(e) => setNovaSaidaDesc(e.target.value)}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Valor (R$)"
                  className="cf-input"
                  value={novaSaidaValor}
                  onChange={(e) => setNovaSaidaValor(e.target.value)}
                />
                <select
                  className="cf-select"
                  value={novaSaidaOrigem}
                  onChange={(e) => setNovaSaidaOrigem(e.target.value as OrigemDinheiro)}
                >
                  <option value="conta_mes">Conta do Mês</option>
                  <option value="reserva_emergencia">Direto da Reserva</option>
                </select>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--cf-muted)' }}>
                <input type="checkbox" checked={novaSaidaFixa} onChange={(e) => setNovaSaidaFixa(e.target.checked)} />
                Conta fixa recorrente
              </label>
              <button type="submit" className="cf-btn cf-btn-primary">
                <Plus size={16} /> Registrar Saída
              </button>
            </form>

            <div style={{ marginTop: '1.2rem' }}>
              <h4 style={{ marginBottom: '0.5rem', fontSize: '0.92rem' }}>Saídas Registradas</h4>
              {saidasDiretas.map((s) => (
                <div key={s.id} className="cf-list-row">
                  <div>
                    <strong>{s.descricao}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--cf-muted)' }}>
                      {s.origem === 'reserva_emergencia' ? 'Saiu da Reserva' : 'Saiu do Saldo do Mês'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <strong style={{ color: '#f87171' }}>{formatBRL(s.valor)}</strong>
                    <button className="cf-btn cf-btn-ghost" style={{ padding: '0.3rem 0.5rem' }} onClick={() => setSaidasDiretas((prev) => prev.filter((i) => i.id !== s.id))}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="cf-card">
            <h3 style={{ marginTop: 0 }}>Entradas do Mês (Salário / Extras)</h3>
            <form onSubmit={adicionarEntrada} style={{ display: 'grid', gap: '0.7rem' }}>
              <input
                type="text"
                placeholder="Ex: Salário, Renda extra..."
                className="cf-input"
                value={novaEntradaDesc}
                onChange={(e) => setNovaEntradaDesc(e.target.value)}
              />
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Valor (R$)"
                  className="cf-input"
                  value={novaEntradaValor}
                  onChange={(e) => setNovaEntradaValor(e.target.value)}
                />
                <button type="submit" className="cf-btn cf-btn-success">
                  <Plus size={16} /> Adicionar
                </button>
              </div>
            </form>

            <div style={{ marginTop: '1.2rem' }}>
              {entradas.map((ent) => (
                <div key={ent.id} className="cf-list-row">
                  <div><strong>{ent.descricao}</strong></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <strong style={{ color: '#4ade80' }}>{formatBRL(ent.valor)}</strong>
                    <button className="cf-btn cf-btn-ghost" style={{ padding: '0.3rem 0.5rem' }} onClick={() => setEntradas((prev) => prev.filter((i) => i.id !== ent.id))}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ABA 3: RESERVA & INVESTIMENTOS */}
      {abaAtiva === 'investimentos' && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem', flexWrap: 'wrap', gap: '0.7rem' }}>
            <div>
              <h3 style={{ margin: 0 }}>Caixinhas e Reservas de Emergência</h3>
              <small style={{ color: 'var(--cf-muted)' }}>Controle de rendimento diário por % do CDI (Mercado Pago, etc.).</small>
            </div>
            <button className="cf-btn cf-btn-primary" onClick={() => setModalReservaAberto(true)}>
              <Plus size={16} /> Adicionar Nova Caixinha
            </button>
          </div>

          <div className="cf-grid-2">
            {investimentos.map((inv) => {
              const rendimentoMes = inv.saldoAtual * (inv.rendimentoMensalPct / 100);
              const rendimentoDia = rendimentoMes / 30;

              return (
                <div key={inv.id} className="cf-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: 0 }}>{inv.nome}</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="badge kind-reserva">{inv.rendimentoMensalPct}% a.m.</span>
                      <button className="cf-btn cf-btn-ghost" style={{ padding: '0.25rem 0.4rem' }} onClick={() => excluirReserva(inv.id)}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div style={{ marginTop: '0.9rem' }}>
                    <label style={{ fontSize: '0.78rem', color: 'var(--cf-muted)' }}>Saldo Atualizado (R$):</label>
                    <input
                      type="number"
                      step="0.01"
                      className="cf-input"
                      style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '0.25rem' }}
                      value={inv.saldoAtual}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setInvestimentos((prev) => prev.map((item) => (item.id === inv.id ? { ...item, saldoAtual: val } : item)));
                      }}
                    />
                  </div>

                  <div style={{ marginTop: '0.9rem', padding: '0.75rem', borderRadius: '12px', background: 'rgba(11, 18, 32, 0.55)', fontSize: '0.84rem', display: 'grid', gap: '0.35rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--cf-muted)' }}>Rendimento diário estimado:</span>
                      <strong style={{ color: '#4ade80' }}>+{formatBRL(rendimentoDia)} / dia</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--cf-muted)' }}>Rendimento mensal estimado:</span>
                      <strong style={{ color: '#4ade80' }}>+{formatBRL(rendimentoMes)} / mês</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {modalReservaAberto && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100, padding: '1rem' }}>
              <div className="cf-card" style={{ width: '100%', maxWidth: '420px', background: '#111827' }}>
                <h3 style={{ marginTop: 0 }}>Adicionar Caixinha / Reserva</h3>
                <form onSubmit={adicionarReservaSubmit} style={{ display: 'grid', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--cf-muted)' }}>Nome da Caixinha:</label>
                    <input type="text" placeholder="Ex: Mercado Pago 140% CDI..." className="cf-input" value={novaReservaNome} onChange={(e) => setNovaReservaNome(e.target.value)} required />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--cf-muted)' }}>Saldo Inicial (R$):</label>
                    <input type="number" step="0.01" className="cf-input" value={novaReservaSaldo} onChange={(e) => setNovaReservaSaldo(e.target.value)} required />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--cf-muted)' }}>Taxa do CDI (Ex: 120 ou 140):</label>
                    <input type="number" step="0.1" className="cf-input" value={novaReservaCdi} onChange={(e) => setNovaReservaCdi(e.target.value)} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button type="button" className="cf-btn cf-btn-ghost" onClick={() => setModalReservaAberto(false)}>Cancelar</button>
                    <button type="submit" className="cf-btn cf-btn-primary">Criar Caixinha</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </section>
      )}

      {/* BARRA INFERIOR DE NAVEGAÇÃO */}
      <nav className="cf-bottom-nav">
        <button className={`cf-nav-btn ${abaAtiva === 'painel' ? 'active' : ''}`} onClick={() => setAbaAtiva('painel')}>
          <CreditCard size={18} /> Cartões
        </button>
        <button className={`cf-nav-btn ${abaAtiva === 'fluxo' ? 'active' : ''}`} onClick={() => setAbaAtiva('fluxo')}>
          <Wallet size={18} /> Entradas & PIX
        </button>
        <button className={`cf-nav-btn ${abaAtiva === 'investimentos' ? 'active' : ''}`} onClick={() => setAbaAtiva('investimentos')}>
          <TrendingUp size={18} /> Reserva
        </button>
      </nav>
    </div>
  );
}