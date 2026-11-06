import 'dotenv/config';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false 
  }
});

pool.connect()
  .then(() => console.log('Base de dados ligada com sucesso à nuvem!'))
  .catch(err => console.error('Erro ao ligar à base de dados:', err));

export default pool;