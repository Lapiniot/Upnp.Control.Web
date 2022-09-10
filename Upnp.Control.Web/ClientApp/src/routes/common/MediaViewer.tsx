import { HTMLAttributes } from "react";
import { DIDLTools } from "./DIDLTools";

export function MediaViewer({ item, className, ...other }: HTMLAttributes<HTMLDivElement> & { item: Upnp.DIDL.Item }) {
    if (!item.res) return <div>Invalid data</div>;
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
    </figure>
}