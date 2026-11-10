export default function errorHandler(err, req, res, next){
    const status = err.status || 500
    if(status === 500) console.error(err)

    const corpo = {
        erro: status === 500 ? 'Erro interno no servidor' : err.message
    }

    if(err.detalhes) corpo.detalhes = err.detalhes

    res.status(status).json(corpo)
}