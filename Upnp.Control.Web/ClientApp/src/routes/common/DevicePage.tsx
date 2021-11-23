import { useParams } from "react-router-dom";
import { withDataFetch, withMemoKey } from "../../components/DataFetch";
import { GridViewMode } from "../../components/GridView";
import WebApi from "../../components/WebApi";
import { DeviceView, TemplatedDataComponentProps } from "./DeviceListView";
import { DeviceRouteParams, UpnpDevice } from "./Types";

const Device = withDataFetch(DeviceView,
    ({ device, category }) => withMemoKey(WebApi.devices(category as string, device).jsonFetch, `${category}|${device}`),
    { usePreloader: false });

export default function (props: TemplatedDataComponentProps<UpnpDevice, DeviceRouteParams> & { viewMode: GridViewMode }) {
    const params = useParams();
    return <Device category={params.category as string} device={params.device as string} {...props} />;
}