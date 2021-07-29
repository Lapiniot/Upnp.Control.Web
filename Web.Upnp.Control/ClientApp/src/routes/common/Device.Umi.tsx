import PlayerWidget from "./PlayerWidget";
import { DataSourceProps, UpnpDevice } from "./Types";
import { BrowseContentAction } from "./actions/Actions";
import { OpenAudioAction } from "./actions/OpenMediaAction";
import { ActionDescriptor, DeviceCard } from "./DeviceCard";
import { ManagePlaylistsAction } from "./actions/ManagePlaylistsAction";
import { PlaylistMenuAction } from "./actions/PlaylistMenuAction";

const umiActions: ActionDescriptor[] = [
    ["browse", BrowseContentAction],
    ["playlists", ManagePlaylistsAction],
    ["quick-playlist", PlaylistMenuAction, { className: "m-0 ms-auto" }],
    ["open", OpenAudioAction, { className: "m-0" }]
];

export default function (props: DataSourceProps<UpnpDevice> & { category?: string }) {
    return <DeviceCard {...props} actions={umiActions}>
        <PlayerWidget udn={props["data-source"].udn} />
    </DeviceCard>;
}