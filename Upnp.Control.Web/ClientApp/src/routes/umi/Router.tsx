import { Navigate, Route, Routes } from "react-router-dom";
import BrowserPage from "../common/BrowserPage";
import DeviceListPage from "../common/DeviceListPage";
import DevicePage from "../common/DevicePage";
import ViewerPage from "../common/ViewerPage";
import DeviceTemplate from "./Device";
import PlaylistManager from "./playlist/PlaylistManager";

export default function () {
    const category = "umi";
    const viewMode = "auto";
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
            <Route path="playlists/*">
                <Route path=":id" element={<PlaylistManager />} />
                <Route path="*" element={<PlaylistManager />} />
                <Route path="0" element={<Navigate to="../../.." />} />
                <Route path="-1" element={<Navigate to="../../.." />} />
            </Route>
        </Route>
    </Routes>
}