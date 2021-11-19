import { Redirect, Route, useRouteMatch } from "react-router";
import RendererDeviceCard from "./Device";
import UmiDeviceCard from "../umi/Device";
import DeviceRouter from "../upnp/Router";
import { UmiActionSvgSymbols } from "../common/SvgSymbols";
import { CategoryRouteParams, DataSourceProps, UpnpDevice } from "../common/Types";
import PlaylistManager from "../umi/playlist/PlaylistManager";
import { UpnpDeviceTools as UDT } from "../common/UpnpDeviceTools";

function TemplateSelector(props: DataSourceProps<UpnpDevice>) {
    if (UDT.isUmiDevice(props["data-source"]))
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
                <PlaylistManager />
            </Route>
        </DeviceRouter>
    </>
}