class ApiError extends Error {
    status: Number
    success:string
    constructor(status: Number, sucess: string = "", message: (string | undefined), stack: string = "") {
        super(message)
        this.status = status
        this.success=sucess
        if (stack) {
             this.stack = stack
        }
        else {
            Error.captureStackTrace(this, this.constructor)

        }
    }
}
export {ApiError}