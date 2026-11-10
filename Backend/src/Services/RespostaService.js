import AppError from "../Utils/AppError.js";
import { DIRETORIAS } from "../Utils/Diretorias.js";
import * as RespostasRepository from '../Repositories/RespostaRepository.js'

const TAMANHO_MAXIMO_TEXTO = 1000

export async function enviarRespostas({idUser, idPesq, lista}) {
    if(!Number.isInteger(idPesq)){
        throw new AppError(400, 'Id da pesquisa inválido')
    }
    if(!Array.isArray(lista) || lista.length === 0){
        throw new AppError(400, 'Envie a lista de respostas')
    }

    const pesquisa = await RespostasRepository.buscarPesquisa(idPesq)

    if(!pesquisa){
        throw new AppError(404, 'Pesquisa não encontrada')
    }
    if(!pesquisa.aberta){
        throw new AppError(400, 'Esta pesquisa não está aberta para respostas')
    }

    const perguntas = await RespostasRepository.buscarPerguntasDaPesquisa(idPesq)
    const idsValidos = new Set(perguntas.map((p) => p.pesquisa_pergunta_id))
    const problemas = []
    const recebidas = new Map()

    for (const item of lista){
        const id = item?.pesquisa_pergunta_id
        if(!idsValidos.has(id)){
            problemas.push({
                pesquisa_pergunta_id: id ?? null,
                motivo: 'Pergunta não pertence a esta pesquisa'
            })
        } else if(recebidas.has(id)){
            problemas.push({
                pesquisa_pergunta_id: id,
                motivo: 'Pergunta respondida mais de uma vez'
            })
        } else{
            recebidas.set(id, item)
        }
    }

    const validas = []
    let area = null

    for(const pergunta of perguntas){
        const id = pergunta.pesquisa_pergunta_id
        const item = recebidas.get(id)

        if(!item){
            problemas.push({
                pesquisa_pergunta_id: id,
                motivo: 'Pergunta sem resposta'
            })
            continue
        }

        if(pergunta.tipo === 'LIKERT'){
            const nota = item.valor_numerico

            if(!Number.isInteger(nota) || nota < 1 || nota > 5){
                problemas.push({
                    pesquisa_pergunta_id: id,
                    motivo: 'Informa uma nota de 1 a 5'
                })
            } else{
                validas.push({
                    pesquisa_pergunta_id: id,
                    valorNumerico: nota,
                    valorTexto: null
                })
            }
        } else if(pergunta.tipo === 'TEXTO'){
            const texto = typeof item.valor_texto === 'string' ? item.valor_texto.trim() : ''

            if(!texto || texto.length > TAMANHO_MAXIMO_TEXTO){
                problemas.push({
                    pesquisa_pergunta_id: id,
                    motivo: `Escreva uma resposta de até ${TAMANHO_MAXIMO_TEXTO} caracteres`
                })
            } else{
                validas.push({
                    pesquisa_pergunta_id: id,
                    valorNumerico: null,
                    valorTexto: texto
                })
            }
        } else if(pergunta.tipo === 'DIRETORIA'){
            if(!DIRETORIAS.includes(item.valor_texto)){
                problemas.push({
                    pesquisa_pergunta_id: id,
                    motivo: 'Escolha uma diretoria válida'
                })
            } else{
                area = item.valor_texto
                validas.push({
                    pesquisa_pergunta_id: id,
                    valorNumerico: null,
                    valorTexto: area
                })
            }
        } else{
            problemas.push({
                pesquisa_pergunta_id: id,
                motivo: 'Tipo de pergunta não suportado'
            })
        }
    }

    if(problemas.length > 0){
        throw new AppError(400, 'Há respostas inválidas ou faltando', problemas )
    }

    try{
        await RespostasRepository.registrarEnvio({
            idUser,
            idPesq,
            respostas: validas,
            area
        })
    } catch(error){
        if(error.code === '23505'){
            throw new AppError(409, 'Você já participou dessa pesquisa')
        }
        throw error
    }
}