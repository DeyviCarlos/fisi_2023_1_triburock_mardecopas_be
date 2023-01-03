export class InternalServerException extends Error{
    constructor(message){
        super(message)
        this.status = 500
    }
}