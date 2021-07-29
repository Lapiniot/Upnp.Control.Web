import { Redirect, Route, RouteComponentProps } from "react-router-dom";
import UmiDeviceCard from "../common/Device.Umi";
import DeviceRouter from "../common/DeviceRouter";
import { UmiActionSvgSymbols } from "../common/SvgSymbols";
import { CategoryRouteParams, PlaylistRoutePath } from "../common/Types";
import PlaylistManager from "./playlist/PlaylistManager";

export default (props: RouteComponentProps<CategoryRouteParams>) => <>
    <UmiActionSvgSymbols />
    <DeviceRouter {...props} deviceTemplate={UmiDeviceCard} listViewMode="auto">
        <Route path={`${props.match.path}/:device/playlists/(0|-1)`} exact render={() => <Redirect to={`/${props.match.params.category}`} />} />
        <Route path={`${props.match.path}/:device/playlists/:id(.*)*` as PlaylistRoutePath} render={props => <PlaylistManager {...props} />} />
    </DeviceRouter>
</>