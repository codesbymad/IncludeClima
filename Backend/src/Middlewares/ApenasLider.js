import AppError from "../Utils/AppError.js";

export default function apenasLider(req, res, next){
    if(!req.usuario?.isLider){
        return next(new AppError(403, 'Acesso restrito a líderes'))
    }
    next()
}