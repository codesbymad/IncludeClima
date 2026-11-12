export function mensagemDeErro(erro, padrao = 'Algo deu errado. Tente novamente.'){
    if (!erro.response) return 'Não foi possível conectar ao servidor'
    return erro.response.data?.erro || padrao
}

export function detalhesDeErro(erro){
    return erro.response?.data?.detalhes || []
}