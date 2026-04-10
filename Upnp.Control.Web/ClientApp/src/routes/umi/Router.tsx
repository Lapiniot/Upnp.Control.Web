import BrowserPage from "@routes/common/BrowserPage";
import DeviceListPage from "@routes/common/DeviceListPage";
import DevicePage from "@routes/common/DevicePage";
import ViewerPage from "@routes/common/ViewerPage";
import DeviceTemplate from "@routes/umi/Device";
import PlaylistManager from "@routes/umi/playlist/PlaylistManager";
import { Navigate, Route, Routes } from "react-router";

export default function Router() {
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