import { ComponentPropsWithRef, useCallback, useMemo } from "react";
import Dialog from "../../../../components/Dialog";

type RemoveItemsDialogProps = ComponentPropsWithRef<typeof Dialog> & {
    onRemove(): void;
}

export default function RemoveItemsDialog({ onDismissed, onRemove, children, className, ...other }: RemoveItemsDialogProps) {
    const onDismissHandler = useCallback((action: string, data: FormData | undefined) => {
        if (action === "remove") {
            onRemove();
        }
        onDismissed?.(action, data);
    }, [onDismissed, onRemove]);

    const actions = useMemo(() => <>
        <Dialog.Button autoFocus>Cancel</Dialog.Button>
        <Dialog.Button value="remove">Remove</Dialog.Button>
    </>, []);

    return <Dialog caption="Do you want to remove items from the playlist?" icon="symbols.svg#delete"
        className={`dialog-scrollable dialog-md${className ? ` ${className}` : ""}`} {...other}
        actions={actions} onDismissed={onDismissHandler}>
        {children}
    </Dialog>
}