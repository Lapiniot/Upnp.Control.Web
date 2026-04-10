import BrowserPage from "@routes/common/BrowserPage";
import DeviceListPage from "@routes/common/DeviceListPage";
import DevicePage from "@routes/common/DevicePage";
import { UpnpDeviceTools as UDT } from "@routes/common/UpnpDeviceTools";
import ViewerPage from "@routes/common/ViewerPage";
import RendererDeviceCard from "@routes/renderers/Device";
import UmiDeviceCard from "@routes/umi/Device";
import { Navigate, Route, Routes } from "react-router";

function TemplateSelector({ dataSource: d, ...props }: DataSourceProps<Upnp.Device> & UI.CategoryRouteParams) {
    if (d && UDT.isUmiDevice(d))
        return <UmiDeviceCard {...props} dataSource={d} />
    else
        return <RendererDeviceCard {...props} dataSource={d} />
}

export default function Router() {
    const category = "renderers";
    const viewMode = "auto";
    return <Routes>
        <Route index element={<DeviceListPage category={category} key={category} itemTemplate={TemplateSelector} viewMode={viewMode} />} />
        <Route path=":device">
            <Route index element={<DevicePage category={category} itemTemplate={TemplateSelector} viewMode={viewMode} />} />
            <Route path="browse/*">
                <Route path=":id" element={<BrowserPage />} />
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