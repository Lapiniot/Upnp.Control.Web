import { ComponentPropsWithRef, useCallback, useMemo } from "react";
import Dialog from "../../../../components/Dialog";

type AddUrlDialogProps = ComponentPropsWithRef<typeof Dialog> & {
    feedUrl?: string;
    feedTitle?: string;
    useProxy?: boolean;
    onAdd(url: string, title: string, useProxy: boolean): void;
}

export default function AddUrlDialog({ onAdd, onDismissed, feedUrl, feedTitle, useProxy, ...other }: AddUrlDialogProps) {

    const onSubmitHandler = useCallback((action: string, data: FormData | undefined) => {
        if (action === "add" && data)
            onAdd(data.get("feed-url") as string, data.get("feed-title") as string, data.get("use-proxy") === "on");
        onDismissed?.(action, data);
    }, [onDismissed, onAdd]);

    const actions = useMemo(() => <>
        <Dialog.Button autoFocus>Cancel</Dialog.Button>
        <Dialog.Button value="add">Add</Dialog.Button>
    </>, []);

    return <Dialog caption="Provide url for media feed" icon="symbols.svg#podcasts" {...other}
        onDismissed={onSubmitHandler} actions={actions}>
        <div className="form-floating mb-3">
            <input type="url" name="feed-url" className="form-control form-control-fill" defaultValue={feedUrl}
                placeholder="feed url" required pattern="http(s?)://.*" aria-label="Url" />
            <label htmlFor="feed-url">Feed url</label>
            <div className="invalid-feedback">Please provide a valid feed url</div>
        </div>
        <div className="form-floating mb-3">
            <input type="text" name="feed-title" className="form-control form-control-fill" defaultValue={feedTitle}
                placeholder="feed title" aria-label="Title" />
            <label htmlFor="feed-title">Title</label>
        </div>
        <div className="form-check form-switch px-0">
            <input type="checkbox" defaultChecked={useProxy} className="form-check-input m-0 mx-2" name="use-proxy" id="use-dlna-proxy" />
            <label className="form-check-label" htmlFor="use-dlna-proxy">Use DLNA proxy</label>
        </div>
    </Dialog>
}