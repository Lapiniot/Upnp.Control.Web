import { ComponentPropsWithRef, useCallback, useMemo } from "react";
import Dialog from "../../../../components/Dialog";

type UploadPlaylistDialogProps = ComponentPropsWithRef<typeof Dialog> & {
    useProxy?: boolean;
    onAdd(data: FormData): void;
}

export default function UploadPlaylistDialog({ onAdd, onDismissed, useProxy, ...other }: UploadPlaylistDialogProps) {

    const onSubmitHandler = useCallback((action: string, data: FormData | undefined) => {
        if (action === "add" && data) onAdd(data);
        onDismissed?.(action, data);
    }, [onAdd, onDismissed]);

    const actions = useMemo(() => <>
        <Dialog.Button autoFocus>Cancel</Dialog.Button>
        <Dialog.Button value="add">Add</Dialog.Button>
    </>, []);

    return <Dialog caption="Upload playlist file" {...other} icon="symbols.svg#playlist_add"
        onDismissed={onSubmitHandler} actions={actions}>
        <input type="file" className="form-control form-control-fill" name="files" accept=".m3u,.m3u8" multiple required />
        <div className="invalid-feedback">Please select at least one playlist file</div>
        <div className="form-check form-switch px-0 mt-3">
            <input type="checkbox" defaultChecked={useProxy} className="form-check-input m-0 mx-2" name="useProxy" value="true" />
            <label htmlFor="useProxy" className="form-check-label">Use DLNA proxy</label>
        </div>
    </Dialog>
}