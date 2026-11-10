import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import AppError from '../Utils/AppError.js'
import * as UsuarioRepository from '../Repositories/UsuarioRepository.js'

const emailValido = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

export async function cadastrar({nome, email, senha}) {
    if(!nome || !email || !senha){
        throw new AppError(400, 'Nome, email e senha são obrigatórios')
    }

    if(!emailValido(email)){
        throw new AppError(400, 'E-mail inválido')
    }

    if(senha.length < 6){
        throw new AppError(400, 'A senha deve ter pelo menos 6 caracteres')
    }

    const emailNormalizado = email.trim().toLowerCase()

    if(await UsuarioRepository.buscarPorEmail(emailNormalizado)){
        throw new AppError(409, 'E-mail já cadastrado')
    }

    const senhaHash = await bcrypt.hash(senha, 10)

    try{
        return await UsuarioRepository.criar({
            nome: nome.trim(),
            email: emailNormalizado,
            senhaHash
        })
    } catch(error){
        if(error.code === '23505'){
            throw new AppError(409, 'E-mail já cadastrado')
        }
        throw error
    }
}

export async function login({email, senha}) {
    if(!email || !senha){
        throw new AppError(400, 'E-mail e senha são obrigatórios')
    }

    const usuario = await UsuarioRepository.buscarPorEmail(
        email.trim().toLowerCase()
    )
    const senhaCorreta = usuario
        ? await bcrypt.compare(senha, usuario.senha)
        : false

    if(!senhaCorreta){
        throw new AppError(401, 'E-mail ou senha inválidos')
    }

    const token = jwt.sign(
        {
            id: usuario.id_user, isLider: usuario.is_lider
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '1d'
        }
    )

    return{
        token,
        usuario:{
            id: usuario.id_user,
            nome: usuario.nome,
            email: usuario.email,
            isLider: usuario.is_lider
        }
    }
}