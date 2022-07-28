declare global {
    type RecursivePartial<T> = { [P in keyof T]?: RecursivePartial<T[P]> }

    type RecursiveReadonly<T> = { readonly [P in keyof T]: RecursiveReadonly<T[P]> }

    type PromiseResult<T> = T extends Promise<infer U> ? U : T
}

export { }