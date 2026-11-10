import pool from '../Config/Database.js';

class PesquisaController {
  // 1. Criar Pesquisa (Só para Líderes)
  async criarPesquisa(req, res) {
    const { titulo, descricao, data_inicio, data_fim } = req.body;
    try {
      const pesquisaResult = await pool.query(
        'INSERT INTO pesquisas (titulo, descricao, data_inicio, data_fim) VALUES ($1, $2, $3, $4) RETURNING *',
        [titulo, descricao, data_inicio, data_fim]
      );
      const novaPesquisa = pesquisaResult.rows[0];
      const perguntas = await pool.query('SELECT id_perg FROM perguntas');
      let posicao = 1;
      for (const p of perguntas.rows) {
        await pool.query(
          'INSERT INTO pesquisa_perguntas (id_pesq, id_perg, posicao) VALUES ($1, $2, $3)',
          [novaPesquisa.id_pesq, p.id_perg, posicao]
        );
        posicao++;
      }
      return res.status(201).json({ mensagem: 'Pesquisa criada com sucesso!', pesquisa: novaPesquisa });
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: 'Erro ao criar pesquisa.' });
    }
  }

  // 2. Lista com Situação, Busca por Nome e "Já Respondi"
  async listarHistorico(req, res) {
    const { titulo } = req.query;
    const userId = req.usuario.id; 

    try {
      let query = `
        SELECT 
          p.id_pesq, p.titulo, p.data_inicio, p.data_fim,
          CASE 
            WHEN CURRENT_DATE BETWEEN p.data_inicio AND p.data_fim THEN 'Ativa'
            WHEN CURRENT_DATE < p.data_inicio THEN 'Programada'
            ELSE 'Encerrada'
          END as situacao,
          EXISTS (
            SELECT 1 FROM participacoes part 
            WHERE part.id_pesq = p.id_pesq AND part.id_user = $1
          ) as ja_respondeu
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
      console.error(erro);
      return res.status(500).json({ erro: 'Erro ao buscar pesquisas.' });
    }
  }

  // 3. Detalhe com perguntas em ordem
  async listarPerguntas(req, res) {
    const { id_pesq } = req.params;

    try {
      const result = await pool.query(`
        SELECT 
          pp.id AS pesquisa_pergunta_id, 
          pp.posicao, 
          perg.enunciado, 
          perg.tipo 
        FROM pesquisa_perguntas pp
        JOIN perguntas perg ON pp.id_perg = perg.id_perg
        WHERE pp.id_pesq = $1
        ORDER BY pp.posicao ASC
      `, [id_pesq]);

      if (result.rows.length === 0) {
        return res.status(404).json({ erro: 'Pesquisa não encontrada ou sem perguntas.' });
      }

      return res.status(200).json(result.rows);
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: 'Erro ao buscar perguntas.' });
    }
  }
  // 4. Reaplicar (Duplicar) Pesquisa
  async reaplicarPesquisa(req, res) {
    const { id } = req.params; // ID da pesquisa antiga
    const { descricao, data_inicio, data_fim } = req.body;

    try {
      const pesqOriginal = await pool.query('SELECT titulo FROM pesquisas WHERE id_pesq = $1', [id]);
      
      if (pesqOriginal.rows.length === 0) {
        return res.status(404).json({ erro: 'Pesquisa original não encontrada.' });
      }
      const tituloOriginal = pesqOriginal.rows[0].titulo;

      const checkTrimestre = await pool.query(`
        SELECT id_pesq FROM pesquisas 
        WHERE titulo = $1 
        AND EXTRACT(YEAR FROM data_inicio) = EXTRACT(YEAR FROM $2::DATE)
        AND EXTRACT(QUARTER FROM data_inicio) = EXTRACT(QUARTER FROM $2::DATE)
      `, [tituloOriginal, data_inicio]);

      if (checkTrimestre.rows.length > 0) {
        return res.status(400).json({ 
          erro: 'Já existe uma edição desta pesquisa para este mesmo trimestre e ano.' 
        });
      }


      const novaPesquisaResult = await pool.query(
        'INSERT INTO pesquisas (titulo, descricao, data_inicio, data_fim) VALUES ($1, $2, $3, $4) RETURNING *',
        [tituloOriginal, descricao, data_inicio, data_fim]
      );
      const novaPesquisa = novaPesquisaResult.rows[0];

      await pool.query(`
        INSERT INTO pesquisa_perguntas (id_pesq, id_perg, posicao) 
        SELECT $1, id_perg, posicao 
        FROM pesquisa_perguntas 
        WHERE id_pesq = $2
      `, [novaPesquisa.id_pesq, id]);

      return res.status(201).json({ 
        mensagem: 'Pesquisa reaplicada com sucesso!', 
        pesquisa: novaPesquisa 
      });

    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: 'Erro ao reaplicar pesquisa.' });
    }
  }
}

export default new PesquisaController();