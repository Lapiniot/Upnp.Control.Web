import { ComponentType, HTMLAttributes } from "react";
import { DataFetchProps, withDataFetch, withMemoKey } from "../../components/DataFetch";
import { LoadIndicatorOverlay } from "../../components/LoadIndicator";
import $api from "../../components/WebApi";
import { DIDLTools } from "./DIDLTools";
import { BrowseFetchResult, ViewRouteParams } from "./Types";

type MediaViewerProps = HTMLAttributes<HTMLDivElement> &
    DataFetchProps<BrowseFetchResult> &
    ViewRouteParams;

export function MediaViewer({ dataContext: ctx, fetching, error, category, device, id, className, ...other }: MediaViewerProps) {
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

const viewFetchOptions = { withParents: true, withMetadata: true, withResourceProps: true };
const defaultViewQueryBuilder = ({ device, id }: ViewRouteParams) => withMemoKey(
    $api.browse(device).get(id).withOptions(viewFetchOptions).jsonFetch, device + "|" + id);
export function withViewerDataFetch<P extends DataFetchProps>(ViewerComponent: ComponentType<P>, usePreloader = true,
    builder = defaultViewQueryBuilder) {
    return withDataFetch<P, ViewRouteParams>(ViewerComponent, builder, { template: LoadIndicatorOverlay, usePreloader });
}