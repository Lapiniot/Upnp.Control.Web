import { ComponentPropsWithRef, useCallback, useMemo } from "react";
import Dialog from "./Dialog";

type TextValueEditDialogProps = ComponentPropsWithRef<typeof Dialog> & {
    confirmText?: string;
    dismissText?: string,
    required?: boolean;
    onConfirmed(value: string): void;
}

export default function Prompt(props: TextValueEditDialogProps) {
    const { defaultValue, confirmText = "OK", dismissText = "Cancel",
        required = true, onConfirmed, onDismissed, ...other } = props;

    const onDismissedHandler = useCallback((action: string, data: FormData | undefined) => {
        if (action === "confirm" && data) {
            onConfirmed?.(data.get("text-input") as string);
        }
        onDismissed?.(action, data);
    }, [onConfirmed, onDismissed]);

    const actions = useMemo(() => <>
        <Dialog.Button>{dismissText}</Dialog.Button>
        <Dialog.Button value="confirm">{confirmText}</Dialog.Button>
    </>, [confirmText, dismissText]);

    return <Dialog {...other} onDismissed={onDismissedHandler} actions={actions}>
        <input type="text" name="text-input" className="form-control form-control-fill" defaultValue={defaultValue}
            placeholder="[provide value]" required={required} />
        <div className="invalid-feedback">Non-empty value is required</div>
    </Dialog>
}