export default class AppError extends Error{
    constructor(status, message, detalhes = null){
        super(message)
        this.status = status
        this.detalhes = detalhes
    }
}