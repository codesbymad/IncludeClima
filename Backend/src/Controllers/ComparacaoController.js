import * as  ComparacaoService from '../Services/ComparacaoService.js'

export async function listarTitulos(req, res, next) {
    try{
        res.json(await ComparacaoService.listarTitulos())
    } catch(error){
        next(error)
    }
}

export async function comparar(req, res, next) {
    try{
        const {anterior, atual, area} = req.query
        res.json(await ComparacaoService.compararEdicoes({anterior, atual, area}))
    } catch(error){
        next(error)
    }
}