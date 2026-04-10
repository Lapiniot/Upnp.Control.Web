import { LoadIndicatorOverlay } from "@components/LoadIndicator";
import { useDataFetch } from "@hooks/DataFetch";
import { MediaViewer } from "@routes/common/MediaViewer";
import WebApi from "@api";
import { type HTMLAttributes } from "react";
import { useParams } from "react-router";

const options = { withChildren: false, withParents: true, withMetadata: true, withResourceProps: true }

const fetchItemAsync = (device: string, id: string) => WebApi.browse(device).get(id).withOptions(options).json()

export default function ViewerPage(props: HTMLAttributes<HTMLDivElement>) {
    const { device, id, "*": path } = useParams<"device" | "id" | "*">();
    const itemId = id ?? path;

    if (!device) throw new Error("Cannot resolve device id from route.");
    if (!itemId) throw new Error("Cannot resolve item id from route.");

    const { fetching, dataContext: { source: { metadata: item = undefined } = {} } = {} } = useDataFetch(fetchItemAsync, device, itemId);

    return !fetching && item ? <MediaViewer {...props} item={item} /> : <LoadIndicatorOverlay />
}