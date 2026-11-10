import 'dotenv/config'
import pool from '../Config/Database.js'

const email = process.argv[2]

if(!email){
    console.error('Uso: node src/Scripts/TornarLider.js email@exemplo.com')
    process.exit(1)
}

const {rowCount} = await pool.query(
    'UPDATE usuarios SET is_lider = true WHERE email = $1', 
    [email.trim().toLowerCase()]
)

console.log(rowCount ? 'Usuário agora é lider' : 'Usuário não encontrado')
await pool.end()