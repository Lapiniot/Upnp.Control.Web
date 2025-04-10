import { cloneElement, ComponentPropsWithRef, ReactElement, ReactNode, Ref, useImperativeHandle, useState } from "react";
import Dialog from "./Dialog";
import { Portal } from "./Portal";

type DialogElement = ReactElement<ComponentPropsWithRef<typeof Dialog>>;

export interface IDialogHost {
    show(dialog: DialogElement): void;
}

export function DialogHost({ ref }: { ref: Ref<IDialogHost> }) {
    useImperativeHandle(ref, () => ({
        show(dialog: DialogElement) {
            const onDismissed = dialog.props.onDismissed;
            setState(cloneElement(dialog, {
                ...dialog.props, immediate: true,
                onDismissed: (action: string, data: FormData | undefined) => {
                    try {
                        onDismissed?.(action, data);
                    } finally {
                        setState(undefined);
                    }
                }
            }));
        }
    }));
    const [state, setState] = useState<ReactNode>();
    return <Portal selector="#modal-root">{state}</Portal>;
}