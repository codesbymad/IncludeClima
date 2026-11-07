import pool from '../Config/Database.js';

async function runSeed() {
  try {
    console.log('A verificar e sincronizar a base de dados...');

    // 1. Lista de perguntas
    const perguntasSeed = [
      { enunciado: 'Como avalia a sua satisfação com a rotina e as tarefas diárias?', tipo: 'numerico', eixo: 'Satisfação com rotina e tarefas' },
      { enunciado: 'Como avalia a sua relação com a liderança da sua área?', tipo: 'numerico', eixo: 'Relação com a liderança' },
      { enunciado: 'Como avalia a clareza e eficiência da comunicação dentro da empresa?', tipo: 'numerico', eixo: 'Clareza e eficiência da comunicação' },
      { enunciado: 'Sente que tem liberdade de expressão no seu ambiente de trabalho?', tipo: 'numerico', eixo: 'Liberdade de expressão' },
      { enunciado: 'Qual o seu nível de satisfação com os encontros presenciais?', tipo: 'numerico', eixo: 'Encontros presenciais' },
      { enunciado: 'Como avalia os benefícios oferecidos pela Include Jr.?', tipo: 'numerico', eixo: 'Benefícios oferecidos' },
      { enunciado: 'Como avalia as suas oportunidades de crescimento dentro da empresa?', tipo: 'numerico', eixo: 'Oportunidades de crescimento' },
      { enunciado: 'Quais são os principais desafios enfrentados no seu dia a dia?', tipo: 'texto', eixo: 'Desafios enfrentados no dia a dia' }
    ];

    for (const p of perguntasSeed) {
      const verificaPergunta = await pool.query('SELECT id_perg FROM perguntas WHERE enunciado = $1', [p.enunciado]);
      
      if (verificaPergunta.rows.length === 0) {
        await pool.query(
          'INSERT INTO perguntas (enunciado, tipo, eixo) VALUES ($1, $2, $3)',
          [p.enunciado, p.tipo, p.eixo]
        );
      }
    }
    console.log('1. Perguntas verificadas (sem repetições)!');

    // 2. Verifica a pesquisa 
    let idDaPesquisa;
    const verificaPesquisa = await pool.query("SELECT id_pesq FROM pesquisas WHERE titulo = 'Pesquisa de Clima - MVP'");

    if (verificaPesquisa.rows.length === 0) {
      const pesquisaResult = await pool.query(`
        INSERT INTO pesquisas (titulo, descricao, data_inicio, data_fim)
        VALUES (
          'Pesquisa de Clima - MVP', 
          'Primeira pesquisa de clima organizacional da Include Jr. focada em levantar métricas e desafios do dia a dia.',
          CURRENT_DATE, 
          CURRENT_DATE + INTERVAL '15 days'
        )
        RETURNING id_pesq;
      `);
      idDaPesquisa = pesquisaResult.rows[0].id_pesq;
      console.log(`2. Pesquisa criada com o ID: ${idDaPesquisa} (duração de 15 dias).`);
    } else {
      idDaPesquisa = verificaPesquisa.rows[0].id_pesq;
      
      console.log(`2. Pesquisa já existia no banco com o ID: ${idDaPesquisa}.`);
    }

    // 3. Vínculos
    const perguntasResult = await pool.query('SELECT id_perg FROM perguntas');
    const todasPerguntas = perguntasResult.rows;

    let posicao = 1;
    for (const pergunta of todasPerguntas) {
      const verificaRelacao = await pool.query(
        'SELECT * FROM pesquisa_perguntas WHERE id_pesq = $1 AND id_perg = $2',
        [idDaPesquisa, pergunta.id_perg]
      );

      if (verificaRelacao.rows.length === 0) {
        await pool.query(`
          INSERT INTO pesquisa_perguntas (id_pesq, id_perg, posicao)
          VALUES ($1, $2, $3)
        `, [idDaPesquisa, pergunta.id_perg, posicao]);
      }
      posicao++;
    }
    console.log('3. Vínculos verificados com sucesso!');
    console.log('Seed finalizado perfeitamente!');

  } catch (erro) {
    console.error('Erro ao executar o seed:', erro);
  } finally {
    pool.end();
  }
}

runSeed();