# IncludeClima - Front-end

Módulo de interface web para o sistema de Pesquisa de Clima Organizacional (PCO) da **Include Jr.**.

## Tecnologias e Bibliotecas
- **React + Vite:** Construção da interface componentizada e ambiente de desenvolvimento rápido.
- **JavaScript (ES6+) & CSS3:** Linguagem base e estilização seguindo a identidade visual da Include Jr.
- **React Router Dom:** Gerenciamento das rotas e controle de navegação por perfil (Membro, Líder e Admin).
- **Axios:** Integração e consumo da API REST do Back-end.
- **Recharts:** Renderização dos gráficos e métricas do Dashboard da diretoria.
- **Lucide React:** Biblioteca de ícones da interface e menu lateral (Sidebar).

## Estrutura de Pastas
- `src/assets/`: Imagens, ícones e logotipos da Include Jr.
- `src/components/`: Componentes reutilizáveis (Sidebar, Header, Escala Likert, Botões).
- `src/contexts/`: Gerenciamento de estado global (Autenticação e sessão do usuário).
- `src/pages/`: Telas principais da aplicação.
- `src/routes/`: Configuração de rotas públicas e privadas.
- `src/services/`: Configuração do cliente HTTP (Axios).

## Como executar
```bash
cd Frontend
npm install
npm run dev

