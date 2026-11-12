export function formatarData(valor){
    if (!valor) return ''
    const [ano, mes, dia] = String(valor).slice(0, 10).split('-')
    return `${dia}/${mes}/${ano}`
}

export function formatarIntervalo(inicio, fim){
    return `${formatarData(inicio)} - ${formatarData(fim)}`
}

export function diasRestantes(dataFim){
    const [ano, mes, dia] = String(dataFim).slice(0, 10).split('-').map(Number)
    const fim = new Date(ano, mes - 1, dia)
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    return Math.round((fim - hoje) / 86400000)
}

export function formatarNumero(valor){
    return Number(valor).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })
}