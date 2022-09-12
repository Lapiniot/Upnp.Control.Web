import { HTMLAttributes } from "react";
import { useParams } from "react-router-dom";
import { useDataFetch } from "../../components/DataFetch";
import { LoadIndicatorOverlay } from "../../components/LoadIndicator";
import WebApi from "../../components/WebApi";
import { MediaViewer } from "./MediaViewer";

const options = { withParents: true, withMetadata: true, withResourceProps: true }

const fetchItemAsync = (device: string, id: string) => WebApi.browse(device).get(id).withOptions(options).json()

export default function (props: HTMLAttributes<HTMLDivElement>) {
    const { device, id, "*": path } = useParams<"device" | "id" | "*">();
    if (!device) throw new Error("Cannot resolve device id from route.");
    if (!id || !path) throw new Error("Cannot resolve item id from route.");

    const { fetching, dataContext: { source: { self: item = undefined } = {} } = {} } = useDataFetch(fetchItemAsync, device, id ?? path);

    return !fetching && item ? <MediaViewer {...props} item={item} /> : <LoadIndicatorOverlay />
}