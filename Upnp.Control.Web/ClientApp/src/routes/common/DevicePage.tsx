import { useParams } from "react-router-dom";
import { useDataFetch } from "../../hooks/DataFetch";
import { GridViewMode } from "../../components/GridView";
import WebApi from "../../services/WebApi";
import { DeviceView } from "./DeviceListView";

type ItemProps = DataSourceProps<Upnp.Device> & UI.CategoryRouteParams

type DevicePageParams = TemplatedDataComponentProps<ItemProps> & { viewMode: GridViewMode } & UI.CategoryRouteParams

const fetchDeviceAsync = (category: string, device: string) => WebApi.devices(category, device).json()

export default function ({ category, ...props }: DevicePageParams) {
    const { device } = useParams<"category" | "device">();
    if (!device) return null;
    const data = useDataFetch(fetchDeviceAsync, category, device);
    return <DeviceView {...props} {...data} category={category} />
}