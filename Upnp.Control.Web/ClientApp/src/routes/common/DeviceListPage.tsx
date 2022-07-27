import { useDataFetch } from "../../components/DataFetch";
import WebApi from "../../components/WebApi";
import { DeviceListView, DeviceListViewProps } from "./DeviceListView";

const fetchDevicesAsync = (category: string) => WebApi.devices(category).json()

export default function DeviceListPage({ category, ...props }: DeviceListViewProps) {
    const data = useDataFetch(fetchDevicesAsync, category);
    return <DeviceListView {...props} {...data} category={category} />
}