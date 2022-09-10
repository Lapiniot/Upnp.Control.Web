import { HTMLAttributes } from "react";
import { useParams } from "react-router-dom";
import { useDataFetch } from "../../components/DataFetch";
import { LoadIndicatorOverlay } from "../../components/LoadIndicator";
import WebApi from "../../components/WebApi";
import { MediaViewer } from "./MediaViewer";

const options = { withParents: true, withMetadata: true, withResourceProps: true }

const fetchItemAsync = (device: string, id: string) => WebApi.browse(device).get(id).withOptions(options).json()

export default function (props: HTMLAttributes<HTMLDivElement>) {
    const { device, id: itemId, "*": reminder } = useParams<"device" | "id" | "*">();
    if (!device) throw new Error("Missing mandatory parameter 'device'");
    if (!itemId) throw new Error("Missing mandatory parameter 'id'");

    const id = (itemId && reminder) ? `${itemId}/${reminder}` : itemId;
    const { fetching, dataContext: { source: { self: item = undefined } = {} } = {} } = useDataFetch(fetchItemAsync, device, id);

    return !fetching && item ? <MediaViewer {...props} item={item} /> : <LoadIndicatorOverlay />
}