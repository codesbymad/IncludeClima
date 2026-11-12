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

export async function listarLideres(req, res, next) {
    try{
        const lideres = await UsuarioService.listarLideres()
    res.json(lideres.map((l) => ({
        id: l.id_user, nome: l.nome, email: l.email
    })))
    } catch (error) {
        next(error)
    }
}