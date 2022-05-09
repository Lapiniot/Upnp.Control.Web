import { HTMLAttributes } from "react";
import { DataFetchProps } from "../../components/DataFetch";
import { DIDLTools } from "./DIDLTools";
import { BrowseFetchResult } from "./Types";

export type MediaViewerProps = HTMLAttributes<HTMLDivElement> & { device: string, id: string };

export function MediaViewer({ dataContext: ctx, fetching, error, device, id, className, ...other }:
    MediaViewerProps & DataFetchProps<BrowseFetchResult>) {
    const { source: { self: item = undefined } = {} } = ctx ?? {};

    if (!item || !item.res) return <div>Invalid data</div>;

    const { title, res: { url } } = item;

    return <figure className={`vstack overflow-hidden p-3 align-items-center${className ? ` ${className}` : ""}`} {...other}>
        <figcaption className="h5">{title}</figcaption>
        {DIDLTools.isMusicTrack(item) ?
            <audio controls>
                <source src={url} type="audio/mp4" />
            </audio> :
            <video controls className="overflow-hidden mw-100">
                <source src={url} />
            </video>}
    </figure>;
}