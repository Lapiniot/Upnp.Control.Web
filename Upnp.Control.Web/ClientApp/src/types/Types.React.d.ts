declare module "react" {
    interface NativeFormEvent extends Event {
        submitter: Nullable<HTMLInputElement | HTMLButtonElement>;
    }

    interface FormEvent {
        nativeEvent: NativeFormEvent;
    }
}

export { }