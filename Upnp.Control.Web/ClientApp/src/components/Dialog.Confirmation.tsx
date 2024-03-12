import { useCallback } from "react";
import Dialog, { DialogProps } from "./Dialog";

type ConfirmationDialogProps = DialogProps & {
    confirmText?: string;
    confirmColor?: UI.ThemeColors,
    dismissText?: string,
    onConfirmed(): void;
}

export default function ({ confirmText = "OK", confirmColor = "primary", dismissText = "Cancel",
    onDismissed, onConfirmed, children, ...other }: ConfirmationDialogProps) {
    const onDismissedHandler = useCallback((action: string, data: FormData | undefined) => {
        if (action === "confirm") {
            onConfirmed?.();
        }
        onDismissed?.(action, data);
    }, [onDismissed, onConfirmed]);

    const renderFooter = useCallback(() => <Dialog.Footer>
        <Dialog.Button>{dismissText}</Dialog.Button>
        <Dialog.Button value="confirm" className={`text-${confirmColor}`}>{confirmText}</Dialog.Button>
    </Dialog.Footer>, [confirmText, dismissText, confirmColor]);

    return <Dialog {...other} renderFooter={renderFooter} onDismissed={onDismissedHandler}>{children}</Dialog>;
}