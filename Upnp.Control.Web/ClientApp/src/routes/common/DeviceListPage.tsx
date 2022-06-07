import { useCallback } from "react";
import { useDataFetch } from "../../components/DataFetch";
import WebApi from "../../components/WebApi";
import { DeviceListView, DeviceListViewProps } from "./DeviceListView";

export default function DeviceListPage({ category, ...props }: DeviceListViewProps) {
    const loader = useCallback(() => WebApi.devices(category).json(), [category]);
    const data = useDataFetch(loader);
    return <DeviceListView {...props} {...data} category={category} />
}