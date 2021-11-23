import { Navigate, Route, Routes } from "react-router-dom";
import BrowserPage from "../common/BrowserPage";
import DeviceListPage from "../common/DeviceListPage";
import DevicePage from "../common/DevicePage";
import ViewerPage from "../common/ViewerPage";
import UpnpDeviceTemplate from "./Device";

export default function () {
    return <Routes>
        <Route index element={<DeviceListPage category="upnp" key="upnp" itemTemplate={UpnpDeviceTemplate} viewMode="grid" />} />
        <Route path=":device">
            <Route index element={<DevicePage itemTemplate={UpnpDeviceTemplate} viewMode="grid" />} />
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