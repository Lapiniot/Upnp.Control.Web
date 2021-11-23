import { Navigate, Route, Routes } from "react-router-dom";
import BrowserPage from "../common/BrowserPage";
import DeviceListPage from "../common/DeviceListPage";
import DevicePage from "../common/DevicePage";
import { DataSourceProps, UpnpDevice } from "../common/Types";
import { UpnpDeviceTools as UDT } from "../common/UpnpDeviceTools";
import ViewerPage from "../common/ViewerPage";
import UmiDeviceCard from "../umi/Device";
import RendererDeviceCard from "./Device";

function TemplateSelector(props: DataSourceProps<UpnpDevice>) {
    if (UDT.isUmiDevice(props["data-source"]))
        return <UmiDeviceCard {...props} />
    else
        return <RendererDeviceCard {...props} />
}

export default function () {
    return <Routes>
        <Route index element={<DeviceListPage category="renderers" key="renderers" itemTemplate={TemplateSelector} viewMode="auto" />} />
        <Route path=":device">
            <Route index element={<DevicePage itemTemplate={TemplateSelector} viewMode="auto" />} />
            <Route path="browse">
                <Route index element={<BrowserPage />} />
                <Route path=":id/*" element={<BrowserPage />} />
                <Route path="-1" element={<Navigate to="../../.." />} />
            </Route>
            <Route path="view">
                <Route path=":id/*" element={<ViewerPage />} />
                <Route path="-1" element={<Navigate to="../../.." />} />
            </Route>
        </Route>
    </Routes>
}