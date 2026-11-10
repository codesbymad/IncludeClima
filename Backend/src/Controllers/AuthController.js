import * as AuthService from '../Services/AuthService.js'
import * as UsuarioRepository from '../Repositories/UsuarioRepository.js'

export async function cadastro(req, res, next) {
    try{
        const usuario = await AuthService.cadastrar(req.body)
            res.status(201).json({
                id: usuario.id_user,
                nome: usuario.nome,
                email: usuario.email,
                idLider: usuario.is_lider
            })
    } catch(error){
        next(error)
    }
}

export async function login(req, res, next) {
    try{
        res.json(await AuthService.login(req.body))
    } catch(error){
        next(error)
    }
}

export async function me(req, res, next) {
    try{
        const usuario = await UsuarioRepository.buscarPorId(req.usuario.id)
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