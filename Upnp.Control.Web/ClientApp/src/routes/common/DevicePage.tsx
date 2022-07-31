import { useParams } from "react-router-dom";
import { useDataFetch } from "../../components/DataFetch";
import { GridViewMode } from "../../components/GridView";
import WebApi from "../../components/WebApi";
import { DeviceView } from "./DeviceListView";
import { UpnpDevice } from "./Types";

type ItemProps = DataSourceProps<UpnpDevice> & UI.CategoryRouteParams

type DevicePageParams = TemplatedDataComponentProps<ItemProps> & { viewMode: GridViewMode } & UI.CategoryRouteParams

const fetchDeviceAsync = (category: string, device: string) => WebApi.devices(category, device).json()

export default function ({ ...props }: DevicePageParams) {
    const { category, device } = useParams<"category" | "device">();
    if (!category || !device) return null;
    const data = useDataFetch(fetchDeviceAsync, category, device);
    return <DeviceView {...props} {...data} category={category as DeviceCategory} />
}