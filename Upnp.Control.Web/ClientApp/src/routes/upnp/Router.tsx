﻿import { Navigate, Route, Routes } from "react-router";
import BrowserPage from "../common/BrowserPage";
import DeviceListPage from "../common/DeviceListPage";
import DevicePage from "../common/DevicePage";
import ViewerPage from "../common/ViewerPage";
import DeviceTemplate from "./Device";

export default function () {
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