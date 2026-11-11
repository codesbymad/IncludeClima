export function faixaDaMedia(media){
    if(media < 2) return 'Crítico'
    if(media < 3) return 'Atenção'
    if(media < 4) return 'Satisfatório'
    return 'Excelente'
}