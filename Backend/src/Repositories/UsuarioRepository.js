import pool from '../Config/Database.js'

export async function buscarPorEmail(email) {
    const { rows } = await pool.query(
        'SELECT id_user, nome, email, senha, is_lider FROM usuarios WHERE email = $1', [email]
    )
    return rows[0]
}

export async function buscarPorId(id) {
    const { rows } = await pool.query(
        'SELECT id_user, nome, email, is_lider FROM usuarios WHERE id_user = $1', [id]
    )
    return rows[0]
}

export async function criar({nome, email, senhaHash}) {
    const { rows } = await pool.query(
        'INSERT INTO usuarios (nome, email, senha, is_lider) VALUES ($1, $2, $3, false) RETURNING id_user, nome, email, is_lider', [nome, email, senhaHash]
    )
    return rows[0]
}

export async function definirLider(email, isLider) {
    const { rows } = await pool.query(
        'UPDATE usuarios SET is_lider = $2 WHERE email = $1 RETURNING id_user, nome, email, is_lider', [email, isLider]
    )
    return rows[0]
}