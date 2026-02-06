declare type ErrorCode = 0 | 1 | 2
declare type ErrorMessage = string | Error

export interface EjsError<N extends ErrorCode, C extends ErrorMessage> {
    code: N
    content: C;
    (code: N, content: C): EjsError<N, C>
    toString(): C
}

export type error = <N extends ErrorCode, C extends ErrorMessage>(
    code: N,
    content: C,
) => EjsError<N, C>
