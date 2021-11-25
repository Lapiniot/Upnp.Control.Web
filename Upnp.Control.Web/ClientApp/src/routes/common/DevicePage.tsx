import { useCallback } from "react";
import { useParams } from "react-router-dom";
import { useDataFetch } from "../../components/DataFetch";
import { GridViewMode } from "../../components/GridView";
import WebApi from "../../components/WebApi";
import { DeviceView, TemplatedDataComponentProps } from "./DeviceListView";
import { CategoryRouteParams, DeviceRouteParams, UpnpDevice } from "./Types";

export default function ({ category, ...props }: TemplatedDataComponentProps<UpnpDevice, DeviceRouteParams> & { viewMode: GridViewMode } & CategoryRouteParams) {
    const { device } = useParams<"device">();
    if (!category) throw new Error("Missing mandatory parameter 'category'");
    if (!device) throw new Error("Missing mandatory parameter 'device'");
    const loader = useCallback(() => WebApi.devices(category, device).jsonFetch(), [category, device]);
    const data = useDataFetch(loader);
    return <DeviceView {...props} {...data} category={category} device={device} />;
}