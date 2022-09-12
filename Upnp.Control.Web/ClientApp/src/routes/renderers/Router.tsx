import { Navigate, Route, Routes } from "react-router-dom";
import BrowserPage from "../common/BrowserPage";
import DeviceListPage from "../common/DeviceListPage";
import DevicePage from "../common/DevicePage";
import { UpnpDeviceTools as UDT } from "../common/UpnpDeviceTools";
import ViewerPage from "../common/ViewerPage";
import UmiDeviceCard from "../umi/Device";
import RendererDeviceCard from "./Device";

function TemplateSelector({ dataSource: d, ...props }: DataSourceProps<Upnp.Device> & UI.CategoryRouteParams) {
    if (d && UDT.isUmiDevice(d))
        return <UmiDeviceCard {...props} dataSource={d} />
    else
        return <RendererDeviceCard {...props} dataSource={d} />
}

export default function () {
    const category = "renderers";
    const viewMode = "auto";
    return <Routes>
        <Route index element={<DeviceListPage category={category} key={category} itemTemplate={TemplateSelector} viewMode={viewMode} />} />
        <Route path=":device">
            <Route index element={<DevicePage category={category} itemTemplate={TemplateSelector} viewMode={viewMode} />} />
            <Route path="browse/*">
                <Route path="*" element={<BrowserPage />} />
                <Route path="-1" element={<Navigate to="../../.." />} />
            </Route>
            <Route path="view/*">
                <Route path="*" element={<ViewerPage />} />
                <Route path="-1" element={<Navigate to="../../.." />} />
            </Route>
        </Route>
    </Routes>
}