
import 'dotenv/config';
import pkg from 'pg';

const { Pool } = pkg;

pkg.types.setTypeParser(1082, (valor) => valor);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.query('SELECT 1')
  .then(() => console.log('Base de dados ligada com sucesso à nuvem!'))
  .catch(err => console.error('Erro ao ligar à base de dados:', err));

export default pool;
