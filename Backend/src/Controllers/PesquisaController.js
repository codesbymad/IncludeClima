import pool from '../Config/Database.js';

function idValido(valor) {
  if (
    typeof valor !== 'number' &&
    (typeof valor !== 'string' || !/^\d+$/.test(valor))
  ) {
    return false;
  }

  const numero = Number(valor);

  return Number.isSafeInteger(numero) && numero > 0;
}

function dataValida(data) {
  if (typeof data !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    return false;
  }

  const [ano, mes, dia] = data.split('-').map(Number);

  const dataVerificada = new Date(Date.UTC(ano, mes - 1, dia));

  return (
    dataVerificada.getUTCFullYear() === ano &&
    dataVerificada.getUTCMonth() === mes - 1 &&
    dataVerificada.getUTCDate() === dia
  );
}

function periodoValido(data_inicio, data_fim) {
  return (
    dataValida(data_inicio) &&
    dataValida(data_fim) &&
    data_fim >= data_inicio
  );
}

class PesquisaController {
  // 1. Criar Pesquisa (Só para Líderes)
  async criarPesquisa(req, res) {
    const {
      titulo,
      descricao,
      data_inicio,
      data_fim,
      perguntas
    } = req.body || {};

    if (typeof titulo !== 'string' || !titulo.trim()) {
      return res.status(400).json({
        erro: 'Informe um título válido para a pesquisa.'
      });
    }

    if (typeof descricao !== 'string' || !descricao.trim()) {
      return res.status(400).json({
        erro: 'Informe uma descrição válida para a pesquisa.'
      });
    }

    if (!periodoValido(data_inicio, data_fim)) {
      return res.status(400).json({
        erro: 'Informe datas válidas. A data final deve ser igual ou posterior à data inicial.'
      });
    }

    if (!Array.isArray(perguntas) || perguntas.length === 0) {
      return res.status(400).json({
        erro: 'Adicione pelo menos uma pergunta à pesquisa.'
      });
    }

    const tiposPermitidos = ['LIKERT', 'TEXTO'];

    let eixosPermitidos;

    try {
      const resultadoEixos = await pool.query(`
        SELECT DISTINCT eixo
        FROM perguntas
        WHERE eixo IS NOT NULL
          AND eixo <> 'Mapeamento'
      `);

      eixosPermitidos = resultadoEixos.rows.map((row) => row.eixo);

      if (!eixosPermitidos.includes('Personalizado')) {
        eixosPermitidos.push('Personalizado');
      }
    } catch (erro) {
      console.error('Erro ao validar eixos:', erro);

      return res.status(500).json({
        erro: 'Não foi possível validar os eixos das perguntas.'
      });
    }

    for (const pergunta of perguntas) {
      if (
        !pergunta ||
        typeof pergunta.enunciado !== 'string' ||
        !pergunta.enunciado.trim() ||
        !tiposPermitidos.includes(pergunta.tipo) ||
        !eixosPermitidos.includes(pergunta.eixo)
      ) {
        return res.status(400).json({
          erro: 'Verifique os enunciados, tipos e eixos das perguntas.'
        });
      }
    }

    let cliente;
    let transacaoAberta = false;

    try {
      cliente = await pool.connect();

      await cliente.query('BEGIN');
      transacaoAberta = true;

      const duplicidadeResult = await cliente.query(`
        SELECT id_pesq
        FROM pesquisas
        WHERE titulo = $1
          AND data_inicio = $2::DATE
          AND data_fim = $3::DATE
        LIMIT 1
      `, [
        titulo.trim(),
        data_inicio,
        data_fim
      ]);

      if (duplicidadeResult.rows.length > 0) {
        await cliente.query('ROLLBACK');
        transacaoAberta = false;

        return res.status(400).json({
          erro: 'Já existe uma pesquisa com este título e estas mesmas datas.'
        });
      }

      const pesquisaResult = await cliente.query(`
        INSERT INTO pesquisas
          (titulo, descricao, data_inicio, data_fim)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `, [
        titulo.trim(),
        descricao.trim(),
        data_inicio,
        data_fim
      ]);

      const novaPesquisa = pesquisaResult.rows[0];

      // Pergunta de diretoria utilizada nos filtros dos resultados.
      const perguntaDiretoria = await cliente.query(`
        INSERT INTO perguntas (enunciado, tipo, eixo)
        VALUES ($1, $2, $3)
        RETURNING id_perg
      `, [
        'Qual sua área de atuação/diretoria na Include?',
        'DIRETORIA',
        'Mapeamento'
      ]);

      await cliente.query(`
        INSERT INTO pesquisa_perguntas
          (id_pesq, id_perg, posicao)
        VALUES ($1, $2, $3)
      `, [
        novaPesquisa.id_pesq,
        perguntaDiretoria.rows[0].id_perg,
        1
      ]);

      // Cadastro das perguntas personalizadas.
      for (let i = 0; i < perguntas.length; i++) {
        const pergunta = perguntas[i];

        const perguntaResult = await cliente.query(`
          INSERT INTO perguntas (enunciado, tipo, eixo)
          VALUES ($1, $2, $3)
          RETURNING id_perg
        `, [
              pergunta.enunciado.trim(),
              pergunta.tipo,
              pergunta.eixo
            ]);

        await cliente.query(`
          INSERT INTO pesquisa_perguntas
            (id_pesq, id_perg, posicao)
          VALUES ($1, $2, $3)
        `, [
          novaPesquisa.id_pesq,
          perguntaResult.rows[0].id_perg,
          i + 2
        ]);
      }

      await cliente.query('COMMIT');
      transacaoAberta = false;

      return res.status(201).json({
        mensagem: 'Pesquisa criada com sucesso!',
        pesquisa: novaPesquisa
      });

    } catch (erro) {
      if (cliente && transacaoAberta) {
        try {
          await cliente.query('ROLLBACK');
        } catch (erroRollback) {
          console.error('Erro ao reverter transação:', erroRollback);
        }
      }

      console.error('Erro ao criar pesquisa:', erro);

      return res.status(500).json({
        erro: 'Erro ao criar pesquisa.'
      });

    } finally {
      if (cliente) {
        cliente.release();
      }
    }
  }


  // 2. Lista com Situação, Busca por Nome e "Já Respondi"
  async listarHistorico(req, res) {
    const { titulo } = req.query;
    const userId = req.usuario.id;

    try {
      let query = `
        SELECT
          p.id_pesq,
          p.titulo,
          p.descricao,
          p.data_inicio,
          p.data_fim,
          CASE
            WHEN (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')::DATE
              BETWEEN p.data_inicio AND p.data_fim THEN 'Ativa'
            WHEN (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')::DATE
              < p.data_inicio THEN 'Programada'
            ELSE 'Encerrada'
          END AS situacao,
          EXISTS (
            SELECT 1
            FROM participacoes part
            WHERE part.id_pesq = p.id_pesq
              AND part.id_user = $1
          ) AS ja_respondeu
        FROM pesquisas p
      `;

      const values = [userId];

      if (titulo) {
        query += ` WHERE p.titulo ILIKE $2`;
        values.push(`%${titulo}%`);
      }

      query += ` ORDER BY p.data_inicio DESC`;

      const result = await pool.query(query, values);

      return res.status(200).json(result.rows);

    } catch (erro) {
      console.error('Erro ao buscar pesquisas:', erro);

      return res.status(500).json({
        erro: 'Erro ao buscar pesquisas.'
      });
    }
  }

  // 3. Detalhe com perguntas em ordem
  async listarPerguntas(req, res) {
    const { id_pesq } = req.params;

    if (!idValido(id_pesq)) {
      return res.status(400).json({
        erro: 'Informe um ID de pesquisa válido.'
      });
    }

    try {
      const result = await pool.query(`
        SELECT
        pp.id AS pesquisa_pergunta_id,
        pp.posicao,
        perg.enunciado,
        perg.tipo,
        perg.eixo
        FROM pesquisa_perguntas pp
        JOIN perguntas perg
          ON pp.id_perg = perg.id_perg
        WHERE pp.id_pesq = $1
        ORDER BY pp.posicao ASC
      `, [Number(id_pesq)]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          erro: 'Pesquisa não encontrada ou sem perguntas.'
        });
      }

      return res.status(200).json(result.rows);

    } catch (erro) {
      console.error('Erro ao buscar perguntas:', erro);

      return res.status(500).json({
        erro: 'Erro ao buscar perguntas.'
      });
    }
  }

  // 4. Reaplicar (Duplicar) Pesquisa
  async reaplicarPesquisa(req, res) {
    const { id } = req.params;
    const { descricao, data_inicio, data_fim } = req.body || {};

    if (!idValido(id)) {
      return res.status(400).json({
        erro: 'Informe um ID de pesquisa válido.'
      });
    }

    if (typeof descricao !== 'string' || !descricao.trim()) {
      return res.status(400).json({
        erro: 'Informe uma descrição válida para a pesquisa.'
      });
    }

    if (!periodoValido(data_inicio, data_fim)) {
      return res.status(400).json({
        erro: 'Informe datas válidas. A data final deve ser igual ou posterior à data inicial.'
      });
    }

    let cliente;
    let transacaoAberta = false;

    try {
      cliente = await pool.connect();

      await cliente.query('BEGIN');
      transacaoAberta = true;

      const originalResult = await cliente.query(`
        SELECT
          p.id_pesq,
          p.titulo,
          COUNT(pp.id) AS total_perguntas
        FROM pesquisas p
        LEFT JOIN pesquisa_perguntas pp
          ON pp.id_pesq = p.id_pesq
        WHERE p.id_pesq = $1
        GROUP BY p.id_pesq
      `, [Number(id)]);

      if (originalResult.rows.length === 0) {
        await cliente.query('ROLLBACK');
        transacaoAberta = false;

        return res.status(404).json({
          erro: 'Pesquisa original não encontrada.'
        });
      }

      const pesquisaOriginal = originalResult.rows[0];

      if (Number(pesquisaOriginal.total_perguntas) === 0) {
        await cliente.query('ROLLBACK');
        transacaoAberta = false;

        return res.status(400).json({
          erro: 'A pesquisa original não possui perguntas.'
        });
      }

      const duplicidadeResult = await cliente.query(`
        SELECT id_pesq
        FROM pesquisas
        WHERE titulo = $1
          AND data_inicio = $2::DATE
          AND data_fim = $3::DATE
        LIMIT 1
      `, [
        pesquisaOriginal.titulo,
        data_inicio,
        data_fim
      ]);

      if (duplicidadeResult.rows.length > 0) {
        await cliente.query('ROLLBACK');
        transacaoAberta = false;

        return res.status(400).json({
          erro: 'Já existe uma pesquisa com este título e estas mesmas datas.'
        });
      }

      const novaPesquisaResult = await cliente.query(`
        INSERT INTO pesquisas
          (titulo, descricao, data_inicio, data_fim)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `, [
        pesquisaOriginal.titulo,
        descricao.trim(),
        data_inicio,
        data_fim
      ]);

      const novaPesquisa = novaPesquisaResult.rows[0];

      await cliente.query(`
        INSERT INTO pesquisa_perguntas
          (id_pesq, id_perg, posicao)
        SELECT
          $1,
          id_perg,
          posicao
        FROM pesquisa_perguntas
        WHERE id_pesq = $2
      `, [
        novaPesquisa.id_pesq,
        Number(id)
      ]);

      await cliente.query('COMMIT');
      transacaoAberta = false;

      return res.status(201).json({
        mensagem: 'Pesquisa reaplicada com sucesso!',
        pesquisa: novaPesquisa
      });

    } catch (erro) {
      if (cliente && transacaoAberta) {
        try {
          await cliente.query('ROLLBACK');
        } catch (erroRollback) {
          console.error('Erro ao reverter transação:', erroRollback);
        }
      }

      console.error('Erro ao reaplicar pesquisa:', erro);

      return res.status(500).json({
        erro: 'Erro ao reaplicar pesquisa.'
      });

    } finally {
      if (cliente) {
        cliente.release();
      }
    }
  }

  async listarEixos(req, res) {
    try {
      const result = await pool.query(`
        SELECT DISTINCT eixo
        FROM perguntas
        WHERE eixo IS NOT NULL
          AND eixo <> 'Mapeamento'
        ORDER BY eixo
      `);

      const eixos = result.rows.map((row) => row.eixo);

      if (!eixos.includes('Personalizado')) {
        eixos.push('Personalizado');
      }

      return res.status(200).json(eixos);
    } catch (erro) {
      console.error('Erro ao listar eixos:', erro);

      return res.status(500).json({
        erro: 'Erro ao buscar eixos.'
      });
    }
  }

}

export default new PesquisaController();