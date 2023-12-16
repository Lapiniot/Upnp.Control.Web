declare module "react" {
    interface HTMLAttributes<T> {
        inert?: "";
        popover?: "auto" | "manual" | "";
        popovertarget?: string;
        popovertargetaction?: "hide" | "show" | "toggle";
    }

    interface NativeFormEvent {
        submitter: Nullable<HTMLInputElement | HTMLButtonElement>;
    }

    interface FormEvent<T> {
        nativeEvent: NativeFormEvent;
    }
}

export { }