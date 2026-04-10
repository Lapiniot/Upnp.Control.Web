import { useDataFetch } from "@hooks/DataFetch";
import { DeviceListView, type DeviceViewProps } from "@routes/common/DeviceListView";
import WebApi from "@api";

const fetchDevicesAsync = (category: string) => WebApi.devices(category).json()

export default function DeviceListPage({ category, ...props }: DeviceViewProps) {
    const data = useDataFetch(fetchDevicesAsync, category);
    return <DeviceListView {...props} {...data} category={category} />
}