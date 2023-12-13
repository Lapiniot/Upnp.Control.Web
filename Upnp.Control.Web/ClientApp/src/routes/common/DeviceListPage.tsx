import { useDataFetch } from "../../hooks/DataFetch";
import WebApi from "../../services/WebApi";
import { DeviceListView, DeviceViewProps } from "./DeviceListView";

const fetchDevicesAsync = (category: string) => WebApi.devices(category).json()

export default function DeviceListPage({ category, ...props }: DeviceViewProps) {
    const data = useDataFetch(fetchDevicesAsync, category);
    return <DeviceListView {...props} {...data} category={category} />
}