import { Redirect, Route, useRouteMatch } from "react-router";
import RendererDeviceCard from "./Device";
import UmiDeviceCard from "../umi/Device";
import DeviceRouter from "../upnp/Router";
import { UmiActionSvgSymbols } from "../common/SvgSymbols";
import { CategoryRouteParams, DataSourceProps, Services, UpnpDevice } from "../common/Types";
import PlaylistPage from "../umi/playlist/Playlist";

function TemplateSelector(props: DataSourceProps<UpnpDevice>) {
    if (props["data-source"].services.find(s => s.type.startsWith(Services.UmiPlaylist)))
        return <UmiDeviceCard {...props} />
    else
        return <RendererDeviceCard {...props} />
}

export default function () {
    const { path, params: { category } } = useRouteMatch<CategoryRouteParams>();
    return <>
        <UmiActionSvgSymbols />
        <DeviceRouter deviceTemplate={TemplateSelector} listViewMode="auto">
            <Route path={`${path}/:device/playlists/(0|-1)`} exact>
                <Redirect to={`/${category}`} />
            </Route>
            <Route path={`${path}/:device/playlists/:id(.*)*`}>
                <PlaylistPage />
            </Route>
        </DeviceRouter>
    </>
}