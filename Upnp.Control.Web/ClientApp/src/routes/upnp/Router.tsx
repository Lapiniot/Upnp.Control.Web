import { ComponentType, PropsWithChildren } from "react";
import { useParams, useRouteMatch } from "react-router";
import { Route, Switch } from "react-router-dom";
import { withDataFetch, withMemoKey } from "../../components/DataFetch";
import $api from "../../components/WebApi";
import BrowserPage from "./Browser";
import DeviceCard from "./Device";
import { DeviceContainer, DeviceListContainer, TemplatedDataComponentProps, ViewMode } from "../common/DeviceList";
import { UpnpActionSvgSymbols } from "../common/SvgSymbols";
import { CategoryRouteParams, DataSourceProps, DeviceRouteParams, UpnpDevice } from "../common/Types";
import ViewerPage from "../common/ViewerRouter";

type DeviceRouterProps = PropsWithChildren<{
    deviceTemplate?: ComponentType<DataSourceProps<UpnpDevice> & DeviceRouteParams>,
    listViewMode?: ViewMode
}>;

const Device = withDataFetch(DeviceContainer,
    ({ device, category }) => withMemoKey($api.devices(category as string, device).jsonFetch, `${category}|${device}`),
    { usePreloader: false });

const DeviceListPage = withDataFetch(DeviceListContainer,
    ({ category }) => withMemoKey($api.devices(category as string).jsonFetch, category as string),
    { usePreloader: false });

function DevicePage(props: TemplatedDataComponentProps<UpnpDevice, DeviceRouteParams> & { viewMode: ViewMode }) {
    const params = useParams<DeviceRouteParams>();
    return <Device {...params} {...props} />;
}

export default function ({ deviceTemplate = DeviceCard, children, listViewMode = "grid" }: DeviceRouterProps) {
    const { path, params: { category } } = useRouteMatch<CategoryRouteParams>();
    return <>
        <UpnpActionSvgSymbols />
        <Switch>
            {children}
            <Route path={`${path}/:device/:action(browse)`}>
                <BrowserPage />
            </Route>
            <Route path={`${path}/:device/:action(view)`}>
                <ViewerPage />
            </Route>
            <Route path={`${path}/:device`} exact>
                <DevicePage itemTemplate={deviceTemplate} viewMode={listViewMode} />
            </Route>
            <Route path={path} exact>
                <DeviceListPage category={category} itemTemplate={deviceTemplate} viewMode={listViewMode} />
            </Route>
        </Switch>
    </>
}