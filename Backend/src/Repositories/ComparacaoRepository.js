import pool from '../Config/Database.js'

export async function listarEdicoes() {
    const {rows} = await pool.query(
        `SELECT p.id_pesq, p.titulo, to_char(p.data_inicio, 'YYYY-MM-DD') AS data_inicio, to_char(p.data_fim, 'YYYY-MM-DD') AS data_fim, (
            SELECT COUNT(*)::int FROM respostas r JOIN pesquisa_perguntas pp ON pp.id = r.pesquisa_pergunta_id JOIN perguntas pg ON pg.id_perg = pp.id_perg WHERE pp.id_pesq = p.id_pesq AND pg.tipo = 'DIRETORIA'
        ) AS participantes FROM pesquisas p ORDER BY p.titulo, p.data_inicio`
    )
    return rows
}

export async function buscarPesquisa(idPesq) {
    const {rows} = await pool.query(
        `SELECT id_pesq, titulo, to_char(data_inicio, 'YYYY-MM-DD') AS data_inicio, to_char(data_fim, 'YYYY-MM-DD') AS data_fim FROM pesquisas WHERE id_pesq = $1`, [idPesq]
    )
    return rows[0] || null
}

export async function contarParticipantes(idPesq, area) {
    const {rows} = await pool.query(
        `SELECT COUNT(*)::int AS total FROM respostas r JOIN pesquisa_perguntas pp ON pp.id = r.pesquisa_pergunta_id JOIN perguntas p ON p.id_perg = pp.id_perg WHERE pp.id_pesq = $1 AND p.tipo = 'DIRETORIA' AND ($2::text IS NULL OR r.area = $2)`, [idPesq, area]
    )
    return rows[0].total
}

export async function mediaGeral(idPesq, area) {
    const {rows} = await pool.query(
        `SELECT AVG(r.valor_numerico)::float AS media FROM respostas r JOIN pesquisa_perguntas pp ON pp.id = r.pesquisa_pergunta_id JOIN perguntas p ON p.id_perg = pp.id_perg WHERE pp.id_pesq = $1 AND p.tipo = 'LIKERT' AND ($2::text IS NULL OR r.area = $2)`, [idPesq, area]
    )
    return rows[0].media
}

export async function mediasPorPergunta(idPesq, area) {
    const {rows} = await pool.query(
        `SELECT p.id_perg, p.enunciado AS pergunta, p.eixo, AVG(r.valor_numerico)::float AS media FROM respostas r JOIN pesquisa_perguntas pp ON pp.id = r.pesquisa_pergunta_id JOIN perguntas p ON p.id_perg = pp.id_perg WHERE pp.id_pesq = $1 AND p.tipo = 'LIKERT' AND ($2::text IS NULL OR r.area = $2) GROUP BY p.id_perg, p.enunciado, p.eixo`, [idPesq, area]
    )
    return rows
}