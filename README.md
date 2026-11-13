# IncludeClima

Sistema Web de Pesquisa de Clima Organizacional (PCO) desenvolvido para a Include Jr.

O IncludeClima permite criar e reaplicar pesquisas, coletar respostas de forma anônima e acompanhar resultados por meio de relatórios e comparações entre diferentes períodos.

## Funcionalidades

- Autenticação de usuários e controle de acesso por perfil.
- Criação de pesquisas com perguntas personalizáveis.
- Reaplicação de pesquisas anteriores.
- Coleta de respostas com proteção da identidade dos participantes.
- Geração de relatórios gerais e por diretoria.
- Comparação de resultados entre diferentes períodos.
- Gerenciamento de lideranças.

## Tecnologias utilizadas

### Front-end

- React
- Vite
- JavaScript
- CSS3
- Axios
- React Router DOM
- Recharts
- Lucide React

### Back-end

- Node.js
- Express
- PostgreSQL
- Biblioteca `pg`
- JWT para autenticação
- bcryptjs para criptografia de senhas
- Swagger para documentação da API

### Ferramentas

- Git e GitHub
- npm
- Visual Studio Code

## Arquitetura do sistema

O IncludeClima utiliza uma arquitetura cliente-servidor, dividida em três partes principais:

- **Front-end:** desenvolvido em React, responsável pela interface e interação com os usuários.
- **Back-end:** desenvolvido em Node.js com Express, responsável pelas regras de negócio, autenticação e processamento das requisições.
- **Banco de dados:** PostgreSQL, responsável pelo armazenamento das informações de usuários, pesquisas, perguntas e respostas.

A comunicação entre o front-end e o back-end ocorre por meio de uma API REST, utilizando requisições HTTP.

A autenticação utiliza tokens JWT, e o controle de acesso é realizado por meio de perfis e permissões.

## Estrutura do projeto

O projeto está organizado em duas pastas principais:

- **Backend/**: contém a API, as regras de negócio, os controladores, as rotas, os serviços e a conexão com o banco de dados.
- **Frontend/**: contém a aplicação React, os componentes, as páginas, os serviços de comunicação com a API e os arquivos de estilo.

Cada parte possui suas próprias dependências e configurações.

### Backend/

- `Database/`: arquivos relacionados ao banco de dados.
- `src/`: código-fonte da API.
  - `Config/`: configurações da aplicação.
  - `Controllers/`: tratamento das requisições.
  - `Middlewares/`: autenticação e controle de acesso.
  - `Repositories/`: operações de acesso aos dados.
  - `Routes/`: definição das rotas da API.
  - `Scripts/`: scripts auxiliares.
  - `Services/`: regras de negócio.
  - `Utils/`: funções utilitárias.

### Frontend/

- `src/`: código-fonte da aplicação.
  - `assets/`: imagens, ícones e recursos visuais.
  - `components/`: componentes reutilizáveis.
  - `contexts/`: gerenciamento de contextos compartilhados.
  - `pages/`: páginas da aplicação.
  - `routes/`: configuração das rotas de navegação.
  - `services/`: comunicação com a API.
  - `utils/`: funções utilitárias.

## Instalação e execução

### Pré-requisitos

- Node.js e npm instalados.
- PostgreSQL configurado.
- Git instalado.

### Configuração das variáveis de ambiente

Antes de iniciar o sistema, configure os arquivos de ambiente utilizando os modelos `.env.example` disponibilizados no projeto.

**Back-end**

Crie o arquivo `.env` dentro da pasta `Backend`, utilizando `Backend/.env.example` como referência.

As variáveis disponíveis são:

- `PORT`: porta utilizada pelo servidor.
- `DATABASE_URL`: endereço de conexão com o PostgreSQL.
- `DATABASE_SSL`: configuração de conexão SSL com o banco de dados.
- `JWT_SECRET`: chave utilizada para assinar os tokens de autenticação.
- `API_URL`: endereço da API.
- `ADMIN_NOME`: configuração do nome do administrador.
- `ADMIN_EMAIL`: configuração do e-mail do administrador.
- `ADMIN_SENHA`: configuração da senha do administrador.

**Front-end**

Crie o arquivo `.env` dentro da pasta `Frontend`, utilizando `Frontend/.env.example` como referência.

Configure:

- `VITE_API_URL`: endereço da API utilizada pelo Front-end.

**Importante:** não compartilhe os arquivos `.env` nem publique credenciais ou chaves secretas no repositório.

### Back-end

1. Acesse a pasta do Back-end:

   ```bash
   cd Backend
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Após configurar as variáveis de ambiente, inicie o servidor em desenvolvimento:

   ```bash
   npm run dev
   ```

Para iniciar em modo normal, utilize:

```bash
npm start
```

### Front-end

1. Abra outro terminal e acesse a pasta do Front-end:

   ```bash
   cd Frontend
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Após configurar a URL da API, inicie a aplicação:

   ```bash
   npm run dev
   ```

### Verificação e compilação

Os comandos a seguir devem ser executados dentro da pasta `Frontend`.

Para verificar o código:

```bash
npm run lint
```

Para gerar a versão de produção:

```bash
npm run build
```

Para visualizar a versão compilada:

```bash
npm run preview
```

## Documentação da API

A API do IncludeClima utiliza arquitetura REST e possui documentação interativa desenvolvida com Swagger, permitindo consultar os endpoints, parâmetros, formatos de requisição e respostas.

Com o Back-end em execução, acesse:

`http://localhost:3000/docs`

### Autenticação — `/auth`

| Método | Endpoint | Acesso | Descrição |
|---|---|---|---|
| POST | `/auth/cadastro` | Público | Cadastra um usuário comum. |
| POST | `/auth/login` | Público | Autentica o usuário e retorna o token JWT. |
| GET | `/auth/me` | Autenticado | Retorna os dados do usuário autenticado. |

### Pesquisas — `/pesquisas`

| Método | Endpoint | Acesso | Descrição |
|---|---|---|---|
| GET | `/pesquisas/historico` | Autenticado | Lista o histórico de pesquisas. |
| POST | `/pesquisas/nova` | Líder | Cria uma pesquisa com perguntas personalizadas. |
| POST | `/pesquisas/:id/reaplicar` | Líder | Reaplica uma pesquisa existente. |
| GET | `/pesquisas/eixos` | Líder | Lista os eixos disponíveis para perguntas. |
| GET | `/pesquisas/:id_pesq/perguntas` | Autenticado | Retorna as perguntas de uma pesquisa. |

### Respostas — `/pesquisas`

| Método | Endpoint | Acesso | Descrição |
|---|---|---|---|
| POST | `/pesquisas/:id_pesq/respostas` | Autenticado | Envia as respostas de uma pesquisa sem associá-las diretamente ao identificador do usuário. |

### Relatórios — `/pesquisas`

| Método | Endpoint | Acesso | Descrição |
|---|---|---|---|
| GET | `/pesquisas/:id_pesq/relatorios/medias` | Líder | Retorna médias e métricas da pesquisa. |
| GET | `/pesquisas/:id_pesq/relatorios/feedbacks` | Líder | Retorna feedbacks textuais agrupados por categoria. |

### Comparação — `/comparacao`

| Método | Endpoint | Acesso | Descrição |
|---|---|---|---|
| GET | `/comparacao/titulos` | Líder | Lista títulos e edições disponíveis para comparação. |
| GET | `/comparacao` | Líder | Compara duas edições do mesmo título, com filtro opcional por diretoria. |

### Diretorias — `/diretorias`

| Método | Endpoint | Acesso | Descrição |
|---|---|---|---|
| GET | `/diretorias` | Autenticado | Lista as diretorias disponíveis no formulário. |

### Usuários — `/usuarios`

| Método | Endpoint | Acesso | Descrição |
|---|---|---|---|
| GET | `/usuarios/lideres` | Líder | Lista os usuários com perfil de liderança. |
| PATCH | `/usuarios/lider` | Líder | Promove ou rebaixa um usuário conforme o e-mail e o campo `isLider`. |

### Autorização

- **Público:** não exige autenticação.
- **Autenticado:** exige um token JWT válido.
- **Líder:** exige autenticação e perfil de liderança.

As rotas protegidas recebem o token no cabeçalho `Authorization`, utilizando o formato `Bearer <token>`.

## Modelo de dados

O banco de dados do IncludeClima utiliza PostgreSQL e possui seis tabelas principais:

| Tabela | Responsabilidade |
|---|---|
| `usuarios` | Armazena os dados dos usuários e seus níveis de acesso. |
| `pesquisas` | Armazena os dados e o período de realização das pesquisas. |
| `perguntas` | Armazena as perguntas disponíveis, seus enunciados, tipos e eixos. |
| `pesquisa_perguntas` | Relaciona perguntas às pesquisas e define a ordem de apresentação. |
| `participacoes` | Registra a participação dos usuários em cada pesquisa. |
| `respostas` | Armazena as respostas numéricas ou textuais e a área informada pelo participante. |

### Principais relacionamentos

- Um usuário pode participar de diferentes pesquisas.
- Uma pesquisa pode possuir várias perguntas.
- Uma pergunta pode ser associada a diferentes pesquisas por meio de `pesquisa_perguntas`.
- Cada associação entre pesquisa e pergunta pode possuir várias respostas.
- A tabela `participacoes` registra quem participou, enquanto `respostas` armazena o conteúdo das respostas sem incluir diretamente o identificador do usuário.

### Tipos de perguntas

- `LIKERT`: respostas numéricas em uma escala de 1 a 5.
- `TEXTO`: respostas abertas.
- `DIRETORIA`: identifica a área de atuação do participante e permite filtrar os relatórios.

Toda pesquisa criada recebe automaticamente uma pergunta do tipo `DIRETORIA`. As demais perguntas podem ser personalizadas durante a criação.

### Anonimato e relatórios

O sistema separa o registro de participação do armazenamento das respostas. A tabela `participacoes` registra o usuário e a pesquisa em que participou, enquanto a tabela `respostas` armazena o conteúdo das respostas sem associá-lo diretamente ao identificador do usuário.

Para preservar o anonimato, a aplicação exige um mínimo de **3 participantes** antes de exibir resultados:

- Nos relatórios individuais, a verificação é realizada tanto para os resultados gerais quanto para os resultados filtrados por diretoria.
- Nas comparações entre períodos, cada uma das duas pesquisas precisa atingir o mínimo de participantes, considerando também o filtro por diretoria.

Os relatórios quantitativos utilizam respostas `LIKERT`, enquanto os qualitativos utilizam respostas `TEXTO`. Os resultados podem ser filtrados por diretoria.
