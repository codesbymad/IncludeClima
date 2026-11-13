import api from './api'

export async function listarHistorico(titulo) {
    const { data } = await api.get('/pesquisas/historico', {
        params: titulo ? { titulo } : {}
    })
    return data
}

export async function listarPerguntas(idPesq) {
    const { data } = await api.get(`/pesquisas/${idPesq}/perguntas`)
    return data
}

export async function listarDiretorias() {
    const { data } = await api.get('/diretorias')
    return data
}

export async function enviarRespostas(idPesq, respostas) {
    const { data } = await api.post(`/pesquisas/${idPesq}/respostas`, respostas)
    return data
}

export async function buscarMedias(idPesq, area) {
    const { data } = await api.get(`/pesquisas/${idPesq}/relatorios/medias`, {
        params: area ? { area } : {}
    })
    return data
}

export async function buscarFeedbacks(idPesq, area) {
    const { data } = await api.get(`/pesquisas/${idPesq}/relatorios/feedbacks`, {
        params: area ? { area } : {}
    })
    return data
}

export async function listarTitulosComparacao() {
    const { data } = await api.get(`/comparacao/titulos`)
    return data
}

export async function compararEdicoes(anterior, atual, area) {
    const { data } = await api.get(`/comparacao`, {
        params: {anterior, atual, ...(area ? { area } : {}) }
    })
    return data
}

export async function criarPesquisa(dados) {
    const { data } = await api.post(`/pesquisas/nova`, dados)
    return data
}

export async function reaplicarPesquisa(idPesq, dados) {
    const { data } = await api.post(`/pesquisas/${idPesq}/reaplicar`, dados)
    return data
}

export async function alterarLider(email, isLider) {
    const { data } = await api.patch(`/usuarios/lider`, { email, isLider })
    return data
}

export async function listarLideres() {
    const { data } = await api.get('/usuarios/lideres')
    return data
}

export async function listarEixos() {
    const { data } = await api.get('/pesquisas/eixos')
    return data
}