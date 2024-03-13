import { ComponentPropsWithRef, useCallback } from "react";
import Dialog from "./Dialog";

type TextValueEditDialogProps = ComponentPropsWithRef<typeof Dialog> & {
    confirmText?: string;
    confirmColor?: UI.ThemeColors,
    dismissText?: string,
    required?: boolean;
    onConfirmed(value: string): void;
}

export default function Prompt(props: TextValueEditDialogProps) {
    const { defaultValue, confirmText = "OK", confirmColor = "primary", dismissText = "Cancel",
        required = true, onConfirmed, onDismissed, ...other } = props;

    const onDismissedHandler = useCallback((action: string, data: FormData | undefined) => {
        if (action === "confirm" && data) {
            onConfirmed?.(data.get("text-input") as string);
        }
        onDismissed?.(action, data);
    }, [onConfirmed, onDismissed]);

    const renderFooter = useCallback(() => <Dialog.Footer>
        <Dialog.Button>{dismissText}</Dialog.Button>
        <Dialog.Button value="confirm" className={`text-${confirmColor}`}>{confirmText}</Dialog.Button>
    </Dialog.Footer>, [confirmText, dismissText, confirmColor]);

    return <Dialog {...other} onDismissed={onDismissedHandler} renderFooter={renderFooter}>
        <input type="text" name="text-input" className="form-control" defaultValue={defaultValue}
            placeholder="[provide value]" required={required} />
        <div className="invalid-feedback">Non-empty value is required</div>
    </Dialog>
}