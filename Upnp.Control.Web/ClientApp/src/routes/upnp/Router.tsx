import { Navigate, Route, Routes } from "react-router";
import BrowserPage from "@routes/common/BrowserPage";
import DeviceListPage from "@routes/common/DeviceListPage";
import DevicePage from "@routes/common/DevicePage";
import ViewerPage from "@routes/common/ViewerPage";
import DeviceTemplate from "@routes/upnp/Device";

export default function Router() {
    const category = "upnp";
    const viewMode = "grid";
    return <Routes>
        <Route index element={<DeviceListPage category={category} itemTemplate={DeviceTemplate} viewMode={viewMode} />} />
        <Route path=":device">
            <Route index element={<DevicePage category={category} itemTemplate={DeviceTemplate} viewMode={viewMode} />} />
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