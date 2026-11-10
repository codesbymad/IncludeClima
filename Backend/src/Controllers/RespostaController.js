import * as RespostaService from '../Services/RespostaService.js'

export async function enviar(req, res, next) {
    try{
        const lista = Array.isArray(req.body) ? req.body : req.body?.respostas

        await RespostaService.enviarRespostas({
            idUser: req.usuario.id,
            idPesq: Number(req.params.id_pesq),
            lista
        })

        res.status(201).json({
            mensagem: 'Respostas registradas com sucesso'
        })
    } catch(Error){
        next(Error)
    }
}