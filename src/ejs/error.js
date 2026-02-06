class EjsError extends Error {
    constructor(code, content) {
        super(content)
        this.code = code
        if (content instanceof Error) {
            this.stack = content.stack
            this.message = content.message
        }
    }
}

export const error = (code, content) => {
    throw new EjsError(code, content)
}
