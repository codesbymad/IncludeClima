import AppError from "../Utils/AppError.js";
import * as UsuarioRepository from '../Repositories/UsuarioRepository.js'

export async function alterarLider(email, isLider, idSolicitante) {
    if(!email || typeof isLider !== 'boolean'){
        throw new AppError(400, 'Informe o e-mail e isLider (true ou false)')
    }

    const emailNormalizado = email.trim().toLowerCase()
    const alvo = await UsuarioRepository.buscarPorEmail(emailNormalizado)

    if(!alvo){
        throw new AppError(404, 'Usuário não encontrado')
    }

    if(alvo.id_user === idSolicitante && !isLider){
        throw new AppError(400, 'Você não pode remover o seu próprio acesso de lider')
    }

    return UsuarioRepository.definirLider(emailNormalizado, isLider)
}