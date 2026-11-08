import pool from '../Config/Database.js';

async function runSeed() {
  try {
    console.log('A iniciar o seed completo do IncludeClima...');

    // 1. INSERIR USUARIOS 
    console.log('1. A verificar usuarios');
    
    // Inserir lider inicial
    const emailLider = 'lider.teste@include.com';
    const checkLider = await pool.query('SELECT id_user FROM usuarios WHERE email = $1', [emailLider]);
    if (checkLider.rows.length === 0) {
      await pool.query(
        "INSERT INTO usuarios (nome, email, senha, is_lider) VALUES ('Lider Include', $1, 'senha123', true)", 
        [emailLider]
      );
    }

    // Inserir 5 usuarios 
    const idsParticipantes = [];
    for (let i = 1; i <= 5; i++) {
      const emailPart = `user${i}@include.com`;
      const checkUser = await pool.query('SELECT id_user FROM usuarios WHERE email = $1', [emailPart]);
      if (checkUser.rows.length === 0) {
        const resUser = await pool.query(
          "INSERT INTO usuarios (nome, email, senha, is_lider) VALUES ($1, $2, 'senha123', false) RETURNING id_user",
          [`Usuario Teste ${i}`, emailPart]
        );
        idsParticipantes.push(resUser.rows[0].id_user);
      } else {
        idsParticipantes.push(checkUser.rows[0].id_user);
      }
    }
    console.log('Usuarios configurados.');

    // 2. INSERIR PERGUNTAS 
    console.log('2. A verificar Perguntas do Questionario');
    const perguntasSeed = [
      { enunciado: 'Qual a sua diretoria atual?', tipo: 'DIRETORIA', eixo: 'Mapeamento' },
      { enunciado: 'Como avalia a sua satisfacao com a rotina e as tarefas?', tipo: 'LIKERT', eixo: 'Satisfacao com rotina e tarefas' },
      { enunciado: 'Como avalia a sua relacao com a lideranca da sua area?', tipo: 'LIKERT', eixo: 'Relacao com a lideranca' },
      { enunciado: 'Como avalia a clareza e eficiencia da comunicacao dentro da empresa?', tipo: 'LIKERT', eixo: 'Clareza e eficiencia da comunicacao' },
      { enunciado: 'Sente que tem liberdade de expressao no seu ambiente de trabalho?', tipo: 'LIKERT', eixo: 'Liberdade de expressao' },
      { enunciado: 'Qual o seu nivel de satisfacao com os encontros presenciais?', tipo: 'LIKERT', eixo: 'Encontros presenciais' },
      { enunciado: 'Como avalia os beneficios oferecidos pela Include Jr.?', tipo: 'LIKERT', eixo: 'Beneficios oferecidos' },
      { enunciado: 'Como avalia as oportunidades de crescimento na Include?', tipo: 'LIKERT', eixo: 'Oportunidades de crescimento' },
      { enunciado: 'Quais sao os principais desafios enfrentados no seu dia a dia?', tipo: 'TEXTO', eixo: 'Desafios enfrentados no dia a dia' }
    ];

    for (const p of perguntasSeed) {
      const checkPerg = await pool.query('SELECT id_perg FROM perguntas WHERE enunciado = $1', [p.enunciado]);
      if (checkPerg.rows.length === 0) {
        await pool.query('INSERT INTO perguntas (enunciado, tipo, eixo) VALUES ($1, $2, $3)', [p.enunciado, p.tipo, p.eixo]);
      }
    }
    console.log('Perguntas fixas configuradas.');

    // 3. INSERIR AS 3 EDICOES DA PESQUISA
    console.log('3. A verificar Edicoes das Pesquisas (Q2, Q3, Q4 2026)...');
    const edicoes = [
      { titulo: 'Pesquisa de Clima - 2 Trimestre 2026', desc: 'Edicao Q2 2026 (Dados de Teste)', inicio: '2026-04-01', fim: '2026-06-30' },
      { titulo: 'Pesquisa de Clima - 3 Trimestre 2026', desc: 'Edicao Q3 2026 (Dados de Teste)', inicio: '2026-07-01', fim: '2026-09-30' },
      { titulo: 'Pesquisa de Clima - 4 Trimestre 2026', desc: 'Edicao Q4 2026 (Dados de Teste)', inicio: '2026-10-01', fim: '2026-12-31' }
    ];

    const idsPesquisas = [];
    for (const edicao of edicoes) {
      const checkPesq = await pool.query('SELECT id_pesq FROM pesquisas WHERE titulo = $1', [edicao.titulo]);
      if (checkPesq.rows.length === 0) {
        const result = await pool.query(`
          INSERT INTO pesquisas (titulo, descricao, data_inicio, data_fim) 
          VALUES ($1, $2, $3, $4) RETURNING id_pesq
        `, [edicao.titulo, edicao.desc, edicao.inicio, edicao.fim]);
        idsPesquisas.push(result.rows[0].id_pesq);
      } else {
        idsPesquisas.push(checkPesq.rows[0].id_pesq);
      }
    }
    console.log('Edicoes da pesquisa configuradas.');

    // 4. VINCULAR PERGUNTAS AS PESQUISAS
    console.log('4. A vincular perguntas as pesquisas');
    const perguntasResult = await pool.query('SELECT id_perg FROM perguntas');
    const todasPerguntas = perguntasResult.rows;

    for (const idPesq of idsPesquisas) {
      let posicao = 1;
      for (const pergunta of todasPerguntas) {
        const checkRel = await pool.query('SELECT id FROM pesquisa_perguntas WHERE id_pesq = $1 AND id_perg = $2', [idPesq, pergunta.id_perg]);
        if (checkRel.rows.length === 0) {
          await pool.query('INSERT INTO pesquisa_perguntas (id_pesq, id_perg, posicao) VALUES ($1, $2, $3)', [idPesq, pergunta.id_perg, posicao]);
        }
        posicao++;
      }
    }
    console.log('Vinculos configurados.');
    
    // 5. GERAR PARTICIPACOES E RESPOSTAS 
    console.log('5. A gerar massa de respostas ficticias');
    // Lista com acentos exatos combinados com o front-end
    const diretorias = ['Presidência', 'Projetos', 'Comercial', 'Marketing', 'Gestão de Pessoas', 'Financeiro'];

    for (const idPesq of idsPesquisas) {
      const linksResult = await pool.query('SELECT id, id_perg FROM pesquisa_perguntas WHERE id_pesq = $1', [idPesq]);
      
      for (const idUser of idsParticipantes) {
        const checkPart = await pool.query('SELECT * FROM participacoes WHERE id_user = $1 AND id_pesq = $2', [idUser, idPesq]);
        
        if (checkPart.rows.length === 0) {
          // Regista que o utilizador participou (Anonimato: desvincula o ID dos dados)
          await pool.query('INSERT INTO participacoes (id_user, id_pesq) VALUES ($1, $2)', [idUser, idPesq]);
          
          // Define qual é a área deste utilizador fictício para esta pesquisa
          const areaDoUsuario = diretorias[Math.floor(Math.random() * diretorias.length)];

          for (const link of linksResult.rows) {
            const pergQuery = await pool.query('SELECT tipo FROM perguntas WHERE id_perg = $1', [link.id_perg]);
            const tipo = pergQuery.rows[0].tipo;

            let valor_numerico = null;
            let valor_texto = null;

            // Corrige a variável de 'pergunta.tipo' para apenas 'tipo'
            if (tipo === 'DIRETORIA') {
              valor_texto = areaDoUsuario;
            } 
            else if (tipo === 'LIKERT') {
              valor_numerico = Math.floor(Math.random() * 5) + 1; // Notas de 1 a 5
            } 
            else if (tipo === 'TEXTO') {
              const feedbacks = [
                'Sobrecarga: Muito volume de tarefas nesta última sprint.',
                'Comunicação: Falta clareza nos repasses entre as diretorias.',
                'Falta de recursos: O meu notebook trava com os programas de design.',
                'Sobrecarga: Prazos muito curtos e acumulados.',
                'Comunicação: Ruídos nas mensagens atrasam a resolução de dúvidas.',
                'Falta de recursos: Precisamos de licenças premium para a equipa.',
                'Tudo a correr bem, sem desafios críticos de momento.'
              ];
              valor_texto = feedbacks[Math.floor(Math.random() * feedbacks.length)];
            }
            
            // INSERE DE FACTO AS RESPOSTAS NO BANCO (com a área vinculada)
            await pool.query(
              'INSERT INTO respostas (pesquisa_pergunta_id, valor_texto, valor_numerico, area) VALUES ($1, $2, $3, $4)',
              [link.id, valor_texto, valor_numerico, areaDoUsuario]
            );
          }   
        }
      }
    }
    console.log('Respostas geradas com sucesso.');
    console.log('SEED CONCLUIDO! O banco esta pronto para testes.');

  } catch (erro) {
    console.error('Erro ao executar o seed:', erro);
  } finally {
    pool.end();
  }
}

runSeed();