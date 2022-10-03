declare module "react" {
    interface HTMLAttributes<T> { inert?: ""}
    interface NativeFormEvent { submitter: Nullable<HTMLInputElement | HTMLButtonElement> }
    interface FormEvent<T> { nativeEvent: NativeFormEvent }
}

export { }