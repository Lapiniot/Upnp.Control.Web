import { useParams } from "react-router-dom";
import { useDataFetch } from "../../components/DataFetch";
import { GridViewMode } from "../../components/GridView";
import WebApi from "../../components/WebApi";
import { DeviceView } from "./DeviceListView";
import { CategoryRouteParams, UpnpDevice, UpnpDeviceCategory } from "./Types";

const fetchDeviceAsync = (category: string, device: string) => WebApi.devices(category, device).json()

type ItemProps = DataSourceProps<UpnpDevice> & CategoryRouteParams

type DevicePageParams = TemplatedDataComponentProps<ItemProps> & { viewMode: GridViewMode } & CategoryRouteParams;

export default function ({ ...props }: DevicePageParams) {
    const { category, device } = useParams<"category" | "device">();
    if (!category || !device) return null;
    const data = useDataFetch(fetchDeviceAsync, category, device);
    return <DeviceView {...props} {...data} category={category as UpnpDeviceCategory} />;
}