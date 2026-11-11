import AppError from '../Utils/AppError.js'
import {DIRETORIAS} from '../Utils/Diretorias.js'
import { faixaDaMedia } from '../Utils/Faixa.js'
import * as ComparacaoRepository from '../Repositories/ComparacaoRepository.js'

const MINIMO_PARTICIPANTES = 3;
const LIMITE_ESTAVEL = 0.1

const arredondar = (valor) => Math.round(valor * 100) / 100

function resumo(pesquisa, participantes, media){
    return{
        id_pesq: pesquisa.id_pesq,
        data_inicio: pesquisa.data_inicio,
        data_fim: pesquisa.data_fim,
        participantes,
        media_geral: media === null ? null : arredondar(media),
        faixa_geral: media === null ? null : faixaDaMedia(media)
    }
}

export async function listarTitulos() {
    const edicoes = await ComparacaoRepository.listarEdicoes()
    const porTitulo = new Map()

    for(const edicao of edicoes){
        if(!porTitulo.has(edicao.titulo)) porTitulo.set(edicao.titulo, [])
        porTitulo.get(edicao.titulo).push(edicao)
    }

    return [...porTitulo.entries()].map(([titulo, lista]) => ({
        titulo,
        pode_comparar: lista.length >= 2,
        edicoes: lista
    }))
}

export async function compararEdicoes({anterior, atual, area}) {
    const idAnterior = Number(anterior)
    const idAtual = Number(atual)

    if(!Number.isInteger(idAnterior) || !Number.isInteger(idAtual)){
        throw new AppError(400, 'Informe os ids das duas edições (anterior e atual)')
    }
    if(idAnterior === idAtual){
        throw new AppError(400, 'Escolha duas edições diferentes')
    }
    if(area && !DIRETORIAS.includes(area)){
        throw new AppError(400, 'Diretoria inválida')
    }

    const [pesqAnterior, pesqAtual] = await Promise.all([
        ComparacaoRepository.buscarPesquisa(idAnterior),
        ComparacaoRepository.buscarPesquisa(idAtual)
    ])

    if (!pesqAnterior || !pesqAtual){
        throw new AppError(404, 'Pesquisa não encontrada')
    }
    if(pesqAnterior.titulo !== pesqAtual.titulo){
        throw new AppError(400, 'As edições precisam ter o mesmo título')
    }

    const filtro = area || null

    const [partAnterior, partAtual] = await Promise.all([
        ComparacaoRepository.contarParticipantes(idAnterior, filtro),
        ComparacaoRepository.contarParticipantes(idAtual, filtro)
    ])

    if(partAnterior < MINIMO_PARTICIPANTES || partAtual < MINIMO_PARTICIPANTES){
        return{
            titulo: pesqAnterior.titulo,
            area: filtro,
            dados_insuficientes: true,
            mensagem: filtro ? 'Poucas respostas nesta diretoria para exibir resultados' : 'Poucas respostas nesta pesquisa para exibir resultados'
        }
    }

    const [mediaAnterior, mediaAtual, perguntasAnterior, perguntasAtual] = await Promise.all([
        ComparacaoRepository.mediaGeral(idAnterior, filtro),
        ComparacaoRepository.mediaGeral(idAtual, filtro),
        ComparacaoRepository.mediasPorPergunta(idAnterior, filtro),
        ComparacaoRepository.mediasPorPergunta(idAtual, filtro)
    ])

    const atualPorId = new Map(perguntasAtual.map((p) => [p.id_perg, p]))

    const variacoes = perguntasAnterior
        .filter((p) => atualPorId.has(p.id_perg))
        .map((p) => {
            const a = atualPorId.get(p.id_perg)
            return{
                id_perg: p.id_perg,
                pergunta: p.pergunta,
                eixo: p.eixo,
                media_anterior: arredondar(p.media), 
                media_atual: arredondar(a.media),
                diferenca: arredondar(a.media - p.media),
                faixa_anterior: faixaDaMedia(p.media),
                faixa_atual: faixaDaMedia(a.media)
            }
        })
        .sort((x, y) => Math.abs(y.diferenca) - Math.abs(x.diferenca))

        let diferencaGeral = null
        let tendencia = null

        if(mediaAnterior !== null && mediaAtual !== null){
            const diferencaReal = mediaAtual - mediaAnterior
            diferencaGeral = arredondar(diferencaReal)
            if(Math.abs(diferencaReal) < LIMITE_ESTAVEL){
                tendencia = 'Estável'
            } else{
                tendencia = diferencaReal > 0 ? 'Melhora' : 'Piora'
            } 
        }

        return{
            titulo: pesqAnterior.titulo,
            area: filtro,
            dados_insuficientes: false,
            anterior: resumo(pesqAnterior, partAnterior, mediaAnterior),
            atual: resumo(pesqAtual, partAtual, mediaAtual),
            diferenca_geral: diferencaGeral,
            tendencia,
            perguntas_em_comum: variacoes.length,
            variacoes
        }
}