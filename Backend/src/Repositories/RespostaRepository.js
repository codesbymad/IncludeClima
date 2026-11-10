import pool from '../Config/Database.js'

export async function buscarPesquisa(idPesq) {
    const {rows} = await pool.query(
        `SELECT id_pesq, (
            data_inicio <= (NOW() AT TIME ZONE 'America/Sao_Paulo')::date AND
            data_fim >= (NOW() AT TIME ZONE 'America/Sao_Paulo')::date
        ) AS aberta FROM pesquisas WHERE id_pesq = $1`, [idPesq]
    )
    return rows[0]
}

export async function buscarPerguntasDaPesquisa(idPesq) {
    const {rows} = await pool.query(
        `SELECT pp.id AS pesquisa_pergunta_id, p.tipo FROM pesquisa_perguntas pp JOIN perguntas p ON p.id_perg = pp.id_perg WHERE pp.id_pesq = $1 ORDER BY pp.posicao`, [idPesq]
    )
    return rows
}

export async function registrarEnvio({idUser, idPesq, respostas, area}) {
    const cliente = await pool.connect()
    try{
        await cliente.query('BEGIN')
        await cliente.query(
            'INSERT INTO participacoes (id_user, id_pesq) VALUES ($1, $2)', [idUser, idPesq]
        )

        for (const r of respostas){
            await cliente.query(
                'INSERT INTO respostas (pesquisa_pergunta_id, valor_numerico, valor_texto, area) VALUES ($1, $2, $3, $4)', [r.pesquisa_pergunta_id, r.valorNumerico, r.valorTexto, area]
            )
        }

        await cliente.query('COMMIT')
    } catch(error){
        await cliente.query('ROLLBACK')
        throw error
    } finally{
        cliente.release()
    }
}