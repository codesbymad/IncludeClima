import * as UsuarioService from '../Services/UsuarioService.js'

export async function alterarLider(req, res, next) {
    try{
        const {email, isLider} = req.body
        const usuario = await UsuarioService.alterarLider(email, isLider, req.usuario.id)
        res.json({
            id: usuario.id_user,
            nome: usuario.nome,
            email: usuario.email,
            idLider: usuario.is_lider
        })
    } catch(error){
        next(error)
    }
}