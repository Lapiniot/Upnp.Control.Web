import { useCallback } from "react";
import Dialog, { DialogProps } from "../../../../components/Dialog";

export default function RemoveItemsDialog({ onDismissed, onRemove, children, className, ...other }: DialogProps & { onRemove(): void }) {
    const onDismissHandler = useCallback((action: string, data: FormData | undefined) => {
        if (action === "remove") {
            onRemove();
        }
        onDismissed?.(action, data);
    }, [onDismissed, onRemove]);

    const renderFooter = useCallback(() => <Dialog.Footer>
        <Dialog.Button autoFocus>Cancel</Dialog.Button>
        <Dialog.Button value="remove" className="text-danger" icon="symbols.svg#delete">Remove</Dialog.Button>
    </Dialog.Footer>, []);

    return <Dialog caption="Do you want to remove items from the playlist?"
        className={`dialog-scrollable${className ? ` ${className}` : ""}`} {...other}
        renderFooter={renderFooter} onDismissed={onDismissHandler}>
        {children}
    </Dialog>;
}