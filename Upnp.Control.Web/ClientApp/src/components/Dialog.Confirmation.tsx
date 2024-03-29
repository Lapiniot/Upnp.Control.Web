import { ComponentPropsWithRef, useCallback, useMemo } from "react";
import Dialog from "./Dialog";

type ConfirmationDialogProps = ComponentPropsWithRef<typeof Dialog> & {
    confirmText?: string;
    dismissText?: string,
    onConfirmed(): void;
}

export default function ({ confirmText = "OK", dismissText = "Cancel",
    onDismissed, onConfirmed, children, ...other }: ConfirmationDialogProps) {
    const onDismissedHandler = useCallback((action: string, data: FormData | undefined) => {
        if (action === "confirm") {
            onConfirmed?.();
        }
        onDismissed?.(action, data);
    }, [onDismissed, onConfirmed]);

    const actions = useMemo(() => <>
        <Dialog.Button>{dismissText}</Dialog.Button>
        <Dialog.Button value="confirm">{confirmText}</Dialog.Button>
    </>, [confirmText, dismissText]);

    return <Dialog {...other} actions={actions} onDismissed={onDismissedHandler}>{children}</Dialog>;
}