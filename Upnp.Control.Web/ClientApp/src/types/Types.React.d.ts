declare module "react" {
    interface HTMLAttributes {
        inert?: "";
        popover?: "auto" | "manual" | "";
        popovertarget?: string;
        popovertargetaction?: "hide" | "show" | "toggle";
    }

    interface NativeFormEvent {
        submitter: Nullable<HTMLInputElement | HTMLButtonElement>;
    }

    interface FormEvent {
        nativeEvent: NativeFormEvent;
    }
}

export { }