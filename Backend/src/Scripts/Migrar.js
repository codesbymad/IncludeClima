import 'dotenv/config'
import { readFileSync } from 'node:fs'
import pool from '../Config/Database.js'

const arquivo = process.argv[2]

if(!arquivo){
    console.error('Informe o arquivo .sql')
}

try{
    await pool.query(readFileSync(arquivo, 'utf8'))
    console.log('Migração aplicada com sucesso')
} catch (err){
    console.log('Erro na migração:', err.message)
    process.exitCode = 1
} finally{
    await pool.end()
}