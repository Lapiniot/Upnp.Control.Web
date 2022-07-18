import { useCallback } from "react";
import Dialog, { DialogProps } from "./Dialog";

type ConfirmationDialogProps = DialogProps & {
    confirmText?: string;
    onConfirmed(): void;
}

export default function ({ title, confirmText = "OK", onDismissed, onConfirmed, children, ...other }: ConfirmationDialogProps) {
    const onDismissedHandler = useCallback((action: string, data: FormData | undefined) => {
        if (action === "confirm") {
            onConfirmed?.();
        }
        onDismissed?.(action, data);
    }, [onDismissed, onConfirmed]);

    const renderFooter = useCallback(() => <Dialog.Footer>
        <Dialog.Button>Cancel</Dialog.Button>
        <Dialog.Button value="confirm" className="text-primary">{confirmText}</Dialog.Button>
    </Dialog.Footer>, [confirmText]);

    return <Dialog title={title} {...other} renderFooter={renderFooter} onDismissed={onDismissedHandler}>{children}</Dialog>;
}