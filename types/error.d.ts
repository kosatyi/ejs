export interface EjsError<N, C> {
    code: N
    content: C;
    (code: N, content: C): EjsError<N, C>
    toString(): C
}

export type error = <N, C extends string | Error>(
    code: N,
    content: C,
) => EjsError<N, C>
