import { withDataFetch, withMemoKey } from "../../components/DataFetch";
import WebApi from "../../components/WebApi";
import { DeviceListView } from "./DeviceListView";

const DeviceListPage = withDataFetch(DeviceListView,
    ({ category }) => withMemoKey(WebApi.devices(category as string).jsonFetch, category as string),
    { usePreloader: false });

export default DeviceListPage;