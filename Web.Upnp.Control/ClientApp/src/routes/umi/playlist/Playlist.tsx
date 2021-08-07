import { useHistory, useLocation, useRouteMatch } from "react-router";
import { PlaylistRouteParams } from "../../common/Types";
import PlaylistManager from "./PlaylistManager";

export default function () {
    const location = useLocation();
    const history = useHistory();
    const match = useRouteMatch<PlaylistRouteParams>();
    return <PlaylistManager location={location} history={history} match={match} />;
}