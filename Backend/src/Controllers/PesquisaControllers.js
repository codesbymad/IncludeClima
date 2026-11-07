import pool from '../Config/Database.js';

export const listarPesquisas = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pesquisas ORDER BY data_inicio DESC');    
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao listar pesquisas:', error);
    return res.status(500).json({ erro: 'Erro interno no servidor ao buscar pesquisas.' });
  }
};
