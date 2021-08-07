import { useHistory, useLocation, useRouteMatch } from "react-router";
import { PlaylistRouteParams } from "../../common/Types";
import PlaylistManager from "./PlaylistManager";

export function PlaylistPage() {
    const location = useLocation();
    const history = useHistory();
    const match = useRouteMatch<PlaylistRouteParams>();
    return <PlaylistManager location={location} history={history} match={match} />;
}