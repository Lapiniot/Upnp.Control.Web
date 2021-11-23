import { Navigate, Route, Routes } from "react-router-dom";
import { GridViewMode } from "../../components/GridView";
import BrowserPage from "../common/BrowserPage";
import DeviceListPage from "../common/DeviceListPage";
import DevicePage from "../common/DevicePage";
import ViewerPage from "../common/ViewerPage";
import UmiDeviceCard from "./Device";
import PlaylistManager from "./playlist/PlaylistManager";

export default function () {
    const category = "umi";
    const viewMode: GridViewMode = "auto";
    const template = UmiDeviceCard;
    return <Routes>
        <Route index element={<DeviceListPage category={category} key={category} itemTemplate={template} viewMode={viewMode} />} />
        <Route path=":device">
            <Route index element={<DevicePage itemTemplate={template} viewMode={viewMode} />} />
            <Route path="browse">
                <Route index element={<BrowserPage />} />
                <Route path=":id/*" element={<BrowserPage />} />
                <Route path="-1" element={<Navigate to="../../.." />} />
            </Route>
            <Route path="view">
                <Route path=":id/*" element={<ViewerPage />} />
                <Route path="-1" element={<Navigate to="../../.." />} />
            </Route>
            <Route path="playlists">
                <Route index element={<PlaylistManager />} />
                <Route path=":id/*" element={<PlaylistManager />} />
                <Route path="0" element={<Navigate to="../../.." />} />
                <Route path="-1" element={<Navigate to="../../.." />} />
            </Route>
        </Route>
    </Routes>
}