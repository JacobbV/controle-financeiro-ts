# 💰 Controle Financeiro Web (V2.1.0) — Cloud & Macro Analytics

> Um sistema pessoal e inteligente de controle financeiro modernizado em **TypeScript**, **React**, **Vite**, **PWA** e **Firebase (Cloud Firestore & Auth)**, projetado para eliminar o trabalho manual de planilhas e o lançamento exaustivo de "compra por compra".

---

## 🚀 Sobre o Projeto

O **Controle Financeiro TS** nasceu da evolução do nosso sistema legado em Python/Flask/SQLite. Enquanto a versão 1 focava no registro micro (cada balinha ou item de compra), a **V2.1.0** foca na **gestão macro e estratégica**:
* **Foco no que importa:** Em vez de digitar extrato inteiro, você gerencia **Entradas**, **Contas Fixas / PIX**, **Atualização Semanal de Faturas de Cartão** e **Múltiplas Caixinhas de Investimento (CDI)**.
* **Sincronização em Nuvem (Cloud):** Dados salvos em tempo real via **Firebase Firestore**, permitindo usar no computador de casa e no celular (PWA) de forma 100% sincronizada.
* **Segurança Restrita:** Autenticação via **Google Auth** com trava estrita por e-mail autorizado (`Row Level Security` / Regras do Firestore).

---

## 🛠️ Tecnologias Utilizadas

| Camada | Tecnologia | Propósito |
| :--- | :--- | :--- |
| **Front-end** | React 18, TypeScript, Vite | Interface reativa, componentizada e ultrarrápida. |
| **Estilização** | CSS Customizado (Dark Mode Tabler-inspired) | Visual escuro, moderno, responsivo e adaptado para PWA mobile. |
| **Ícones** | Lucide React | Biblioteca de ícones limpos e consistentes. |
| **Banco de Dados** | Firebase Cloud Firestore (Região South America / SP) | Persistência em nuvem estruturada por usuário. |
| **Autenticação** | Firebase Auth (Google Provider) | Login seguro com 1 clique e restrição de acesso por e-mail. |
| **Hospedagem / Deploy** | GitHub Pages / Firebase Hosting | Disponibilização web estática e PWA instalável no iPhone/Android. |

---

## 📋 Funcionalidades da V2.1.0

1. **Dashboard de Resumo Macro:**
   - Entradas do mês vs. Saídas Totais (Giro).
   - Balanço livre e indicador visual (*No Azul* / *No Sufoco*).
   - Alerta inteligente de rombo com opção de cobertura automática pelas reservas.
2. **Módulo de Cartões Inteligente:**
   - Gestão de múltiplos cartões (BB, Inter, NU, Neon, etc.).
   - Configuração de dia de fechamento, vencimento, cor personalizada e meta/teto de gastos.
   - Atualização semanal rápida do valor da fatura sem necessidade de lançar compra por compra.
   - Botão de quitação com status visual (*A Pagar* vs. *Paga ✓*).
   - Opções completas de **Adicionar** e **Editar** direto por modais.
3. **Controle de Entradas e Saídas Diretas:**
   - Cadastro de fontes de renda fixa ou extras.
   - Lançamento de PIX e contas fixas recorrentes (como internet e serviços).
   - Escolha da origem do dinheiro (*Conta do Mês* ou *Direto da Reserva*).
4. **Caixinhas e Reservas de Emergência (% do CDI):**
   - Suporte a múltiplas caixinhas (ex.: Mercado Pago 120% / 140% CDI).
   - Cálculo automático de rendimento estimado **diário** e **mensal**.

---

## ⚙️ Como Rodar o Projeto Localmente

Certifique-se de ter o **Node.js** instalado na sua máquina.

```powershell
# 1. Clone o repositório
git clone https://github.com/JacobbV/controle-financeiro-ts.git
cd controle-financeiro-ts

# 2. Instale as dependências
npm install

# 3. Configure o arquivo src/firebase.ts com as suas credenciais do Firebase

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

Depois abra no navegador: `http://localhost:5173`

---

# 📈 Histórico de Evolução (Legado & Nova Fase)

| Versão | Stack | Principais Entregas |
| :--- | :--- | :--- |
| **V1.0.0 a V1.8.4** | Python / Flask / SQLite | Versão desktop portada para web local, suporte a PWA, gráficos Chart.js e controle micro de compras/estornos parciais. |
| **V2.0.0** | TypeScript / React / Firebase | Mudança estrutural para a nuvem (Cloud Firestore), simplificação para gestão macro e login Google. |
| **V2.1.0** | TypeScript / React / Firebase | Múltiplas caixinhas com cálculo diário de CDI (Mercado Pago), modal de edição completa de cartões e refinamento de design sóbrio. |

---

## 🔮 Próximas Prospecções (Roadmap Futuro)

- [ ] **V2.2.0:** Histórico comparativo de meses anteriores com gráficos de evolução patrimonial.
- [ ] **V2.3.0:** Metas de economia anuais e projeção de independência financeira.
- [ ] **V2.4.0:** Notificações push para fechamento e vencimento de faturas de cartão.

---

## 👨‍💻 Autor

Desenvolvido por **JacobbV**.