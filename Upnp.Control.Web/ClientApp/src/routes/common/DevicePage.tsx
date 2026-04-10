import { type GridViewMode } from "@components/GridView";
import { useDataFetch } from "@hooks/DataFetch";
import { DeviceView } from "@routes/common/DeviceListView";
import WebApi from "@api";
import { useParams } from "react-router";

type ItemProps = DataSourceProps<Upnp.Device> & UI.CategoryRouteParams

type DevicePageParams = TemplatedDataComponentProps<ItemProps> & { viewMode: GridViewMode } & UI.CategoryRouteParams

const fetchDeviceAsync = (category: string, device: string | undefined) =>
    device ? WebApi.devices(category, device).json() : null

export default function DevicePage({ category, ...props }: DevicePageParams) {
    const { device } = useParams<"category" | "device">();
    const data = useDataFetch(fetchDeviceAsync, category, device);
    return <DeviceView {...props} {...data} category={category} />
}