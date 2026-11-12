function dataReal(dia, mes, ano){
    const d = new Date(ano, mes - 1, dia)
    const ok = d.getFullYear() === ano && d.getMonth() === mes - 1 && d.getDate() === dia
    return ok ? d : null
}

const iso = (ano, mes, dia) => 
    `${String(ano).padStart(4, '0')}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`

export function lerPeriodo(texto){
    const n = texto.replace(/\D/g, '')
    if (n.length !== 16) return { erro: 'Informe as duas datas completas.'}

    const [d1, m1, a1, d2, m2, a2] = [
        n.slice(0, 2), n.slice(2, 4), n.slice(4, 8), n.slice(8, 10), n.slice(10, 12), n.slice(12, 16)
    ].map(Number)

    const inicio = dataReal(d1, m1, a1)
    const fim = dataReal(d2, m2, a2)

    if(!inicio || !fim) return { erro: 'Data inválida. Verifique o dia e o mês.'}
    if(fim < inicio) return {erro: 'A data final não pode ser anterior à inicial'}

    return { data_inicio: iso(a1, m1, d1), data_fim: iso(a2, m2, d2)}
}