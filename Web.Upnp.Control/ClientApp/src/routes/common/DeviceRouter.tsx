import { ComponentType, PropsWithChildren } from "react";
import { Switch, Route } from "react-router-dom"
import { RouteComponentProps } from "react-router";
import Browser from "./BrowserRouter";
import Viewer from "./ViewerRouter";
import $api from "../../components/WebApi";
import { withDataFetch, withMemoKey } from "../../components/DataFetch";
import DeviceCard from "./Device.Upnp";
import { CategoryRouteParams, CategoryRoutePath, DataSourceProps, DeviceRouteParams, DeviceRoutePath, UpnpDevice } from "./Types";
import { DeviceContainer, DeviceListContainer } from "./DeviceList";
import { UpnpActionSvgSymbols } from "./SvgSymbols";

type DeviceRouterProps = PropsWithChildren<{ deviceTemplate?: ComponentType<DataSourceProps<UpnpDevice> & DeviceRouteParams> }>
    & RouteComponentProps<CategoryRouteParams>

const Device = withDataFetch(DeviceContainer,
    ({ device, category }) => withMemoKey($api.devices(category as string, device).jsonFetch, `${category}|${device}`),
    { usePreloader: false });

const Devices = withDataFetch(DeviceListContainer,
    ({ category }) => withMemoKey($api.devices(category as string).jsonFetch, category as string),
    { usePreloader: false });

export default ({ match: { path, params: { category } }, deviceTemplate = DeviceCard, children }: DeviceRouterProps) => <>
    <UpnpActionSvgSymbols />
    <Switch>
        {children}
        <Route path={`${path}/:device/:action(browse)` as DeviceRoutePath} render={props => <Browser {...props} />} />
        <Route path={`${path}/:device/:action(view)` as DeviceRoutePath} render={props => <Viewer {...props} />} />
        <Route path={`${path}/:device` as DeviceRoutePath} exact render={props => <Device itemTemplate={deviceTemplate} {...props.match.params} />} />
        <Route path={path as CategoryRoutePath} exact render={() => <Devices category={category} itemTemplate={deviceTemplate} />} />
    </Switch>
</>