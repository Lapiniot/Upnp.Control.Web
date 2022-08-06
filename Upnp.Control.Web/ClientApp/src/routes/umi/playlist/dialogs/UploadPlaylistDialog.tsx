import { useCallback } from "react";
import Dialog, { DialogProps } from "../../../../components/Dialog";

type UploadPlaylistDialogProps = DialogProps & {
    useProxy?: boolean;
    onAdd(data: FormData): void;
}

export default function UploadPlaylistDialog({ onAdd, onDismissed, useProxy, ...other }: UploadPlaylistDialogProps) {

    const onSubmitHandler = useCallback((action: string, data: FormData | undefined) => {
        if (action === "add" && data) onAdd(data);
        onDismissed?.(action, data);
    }, [onAdd, onDismissed]);

    const renderFooter = useCallback(() =>
        <Dialog.Footer>
            <Dialog.Button autoFocus>Cancel</Dialog.Button>
            <Dialog.Button value="add" className="text-primary" icon="symbols.svg#playlist_add">Add</Dialog.Button>
        </Dialog.Footer>, []);

    return <Dialog caption="Upload playlist file" {...other} onDismissed={onSubmitHandler} renderFooter={renderFooter}>
        <input type="file" className="form-control" name="files" accept=".m3u,.m3u8" multiple required />
        <div className="invalid-feedback">Please select at least one playlist file</div>
        <div className="form-check form-switch px-0 mt-3">
            <input type="checkbox" defaultChecked={useProxy} className="form-check-input m-0 mx-2" name="useProxy" value="true" />
            <label htmlFor="useProxy" className="form-check-label">Use DLNA proxy</label>
        </div>
    </Dialog>
}