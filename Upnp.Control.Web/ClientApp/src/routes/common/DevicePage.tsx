import { useParams } from "react-router-dom";
import { useDataFetch } from "../../components/DataFetch";
import { GridViewMode } from "../../components/GridView";
import WebApi from "../../components/WebApi";
import { DeviceView, TemplatedDataComponentProps } from "./DeviceListView";
import { CategoryRouteParams, DeviceRouteParams, UpnpDevice } from "./Types";

const fetchDeviceAsync = (category: string, device: string) => WebApi.devices(category, device).json()

export default function ({ category, ...props }: TemplatedDataComponentProps<UpnpDevice, DeviceRouteParams> & { viewMode: GridViewMode } & CategoryRouteParams) {
    const { device } = useParams<"device">();
    if (!category) throw new Error("Missing mandatory parameter 'category'");
    if (!device) throw new Error("Missing mandatory parameter 'device'");
    const data = useDataFetch(fetchDeviceAsync, category, device);
    return <DeviceView {...props} {...data} category={category} device={device} />;
}