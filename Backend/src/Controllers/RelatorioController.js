import pool from '../Config/Database.js';

class RelatorioController {
  // 1. Relatório Quantitativo 
  async getMedias(req, res) {
    const { id_pesq } = req.params;
    const { area } = req.query;

    try {
      // Calcular as médias por pergunta 
      let query = `
        SELECT 
          perg.eixo,
          perg.enunciado,
          ROUND(AVG(r.valor_numerico), 2) AS media,
          ROUND(COALESCE(STDDEV(r.valor_numerico), 0), 2) AS desvio_padrao,
          COUNT(r.valor_numerico) FILTER (WHERE r.valor_numerico = 1) AS dist_1,
          COUNT(r.valor_numerico) FILTER (WHERE r.valor_numerico = 2) AS dist_2,
          COUNT(r.valor_numerico) FILTER (WHERE r.valor_numerico = 3) AS dist_3,
          COUNT(r.valor_numerico) FILTER (WHERE r.valor_numerico = 4) AS dist_4,
          COUNT(r.valor_numerico) FILTER (WHERE r.valor_numerico = 5) AS dist_5
        FROM respostas r
        JOIN pesquisa_perguntas pp ON r.pesquisa_pergunta_id = pp.id
        JOIN perguntas perg ON pp.id_perg = perg.id_perg
        WHERE pp.id_pesq = $1 AND perg.tipo = 'LIKERT'
      `;
      const values = [id_pesq];

      if (area) {
        query += ` AND r.area = $2`;
        values.push(area);
      }

      query += ` GROUP BY perg.id_perg, perg.eixo, perg.enunciado ORDER BY perg.eixo;`;
      const result = await pool.query(query, values);

      // Função para classificar a faixa
      const definirFaixa = (media) => {
        if (media < 2.5) return 'Crítico';
        if (media < 3.5) return 'Atenção';
        if (media < 4.5) return 'Satisfatório';
        return 'Excelente';
      };

      const metricas = result.rows.map(row => ({
        eixo: row.eixo,
        pergunta: row.enunciado,
        media: parseFloat(row.media),
        faixa: definirFaixa(parseFloat(row.media)),
        desvio_padrao: parseFloat(row.desvio_padrao),
        alerta_variacao: parseFloat(row.desvio_padrao) > 1.2 ? 'Alta divergência de opiniões' : 'Normal',
        distribuicao: {
          1: parseInt(row.dist_1),
          2: parseInt(row.dist_2),
          3: parseInt(row.dist_3),
          4: parseInt(row.dist_4),
          5: parseInt(row.dist_5)
        }
      }));

      // Calcular a Média Geral 
      let queryGeral = `
        SELECT ROUND(AVG(r.valor_numerico), 2) AS media_geral
        FROM respostas r
        JOIN pesquisa_perguntas pp ON r.pesquisa_pergunta_id = pp.id
        JOIN perguntas perg ON pp.id_perg = perg.id_perg
        WHERE pp.id_pesq = $1 AND perg.tipo = 'LIKERT'
      `;
      const valuesGeral = [id_pesq];

      if (area) {
        queryGeral += ` AND r.area = $2`;
        valuesGeral.push(area);
      }

      const resultGeral = await pool.query(queryGeral, valuesGeral);
      const mediaGeralVal = resultGeral.rows[0].media_geral ? parseFloat(resultGeral.rows[0].media_geral) : 0;

      return res.status(200).json({
        media_geral: mediaGeralVal,
        faixa_geral: definirFaixa(mediaGeralVal),
        metricas_por_pergunta: metricas
      });

    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: 'Erro ao gerar relatório de médias.' });
    }
  }

  // 2. Relatório Qualitativo 
  async getFeedbacks(req, res) {
    const { id_pesq } = req.params;
    const { area } = req.query;

    try {
      let query = `
        SELECT r.valor_texto
        FROM respostas r
        JOIN pesquisa_perguntas pp ON r.pesquisa_pergunta_id = pp.id
        JOIN perguntas perg ON pp.id_perg = perg.id_perg
        WHERE pp.id_pesq = $1 AND perg.tipo = 'TEXTO'
      `;
      const values = [id_pesq];

      if (area) {
        query += ` AND r.area = $2`;
        values.push(area);
      }

      const result = await pool.query(query, values);

      // Agrupar por categorias 
      const categorias = {
        'Sobrecarga': [],
        'Comunicação': [],
        'Falta de recursos': [],
        'Geral': []
      };

      result.rows.forEach(row => {
        const texto = row.valor_texto;
        if (texto.includes('Sobrecarga:')) {
          categorias['Sobrecarga'].push(texto.replace('Sobrecarga: ', ''));
        } else if (texto.includes('Comunicação:')) {
          categorias['Comunicação'].push(texto.replace('Comunicação: ', ''));
        } else if (texto.includes('Falta de recursos:')) {
          categorias['Falta de recursos'].push(texto.replace('Falta de recursos: ', ''));
        } else {
          categorias['Geral'].push(texto);
        }
      });

      // Remove chaves vazias para limpar 
      Object.keys(categorias).forEach(key => {
        if (categorias[key].length === 0) delete categorias[key];
      });

      return res.status(200).json(categorias);
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: 'Erro ao buscar feedbacks qualitativos.' });
    }
  }
}

export default new RelatorioController();