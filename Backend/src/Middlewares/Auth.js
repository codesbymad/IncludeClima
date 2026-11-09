import jwt from 'jsonwebtoken'
import AppError from '../Utils/AppError.js'

export default function auth(req, res, next){
    const header = req.headers.authorization
    if(!header || !header.startsWith('Bearer ')){
        return next(new AppError(401, 'Token não informado'))
    }

    const token = header.split(' ')[1]

    try{
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        req.usuario = { id: payload.id, isLider: payload.isLider}
        next()
    } catch{
        next(new AppError(401, 'Token inválido ou expirado'))
    }
}