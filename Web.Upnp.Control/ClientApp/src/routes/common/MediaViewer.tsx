import { HTMLAttributes } from "react";
import { DataFetchProps } from "../../components/DataFetch";
import { DIDLUtils } from "./BrowserUtils";
import { BrowseFetchResult, ViewRouteParams } from "./Types";

type MediaViewerProps = HTMLAttributes<HTMLDivElement> &
    DataFetchProps<BrowseFetchResult> &
    ViewRouteParams;

export function MediaViewer({ dataContext: ctx, fetching, error, category, device, id, className, ...other }: MediaViewerProps) {
    const { source: { self: item = undefined } = {} } = ctx ?? {};

    if (!item || !item.res) return <div>Invalid data</div>;

    const { title, res: { url } } = item;

    return <figure className={`flex-fill overflow-hidden p-3 d-flex flex-column align-items-center${className ? ` ${className}` : ""}`} {...other}>
        <figcaption className="h5">{title}</figcaption>
        {DIDLUtils.isMusicTrack(item) ?
            <audio controls>
                <source src={url} type="audio/mp4" />
            </audio> :
            <video controls className="overflow-hidden mw-100">
                <source src={url} />
            </video>}
    </figure>;
}