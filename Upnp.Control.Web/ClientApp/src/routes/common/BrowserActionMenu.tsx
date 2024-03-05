import { DropdownMenu, MenuItem } from "../../components/DropdownMenu";
import Toolbar from "../../components/Toolbar";
import { isContainer, isMediaItem, isMusicTrack } from "./DIDLTools";
import { useRowStates } from "../../components/RowStateContext";

export function renderActionMenuItem(udn: string, action: string, name: string) {
    return <MenuItem key={`${action}.${udn}`} action={`${action}.${udn}`} data-udn={udn}>&laquo;{name}&raquo;</MenuItem>;
}

type BrowserActionMenuProps = {
    umis: Upnp.Device[];
    renderers: Upnp.Device[];
    onSelected?: (action: string, udn: string, selection: Upnp.DIDL.Item[]) => void;
};

export function BrowserActionMenu({ umis, renderers, onSelected }: BrowserActionMenuProps) {
    const { selection, dispatch } = useRowStates();

    const umiAcceptable = selection.some(i => isContainer(i) || isMusicTrack(i));
    const rendererAcceptable = selection.some(isMediaItem);
    const enabled = umiAcceptable || rendererAcceptable;

    const onSelectedHandler = ({ dataset: { action, udn } }: HTMLElement) => {
        onSelected?.(action as string, udn as string, selection);
        dispatch({ type: "SET_ALL", selected: false });
    }

    return <>
        <Toolbar.Button key="main-menu" glyph="symbols.svg#more_vert" data-toggle="dropdown"
            className="btn-round btn-plain ms-auto" disabled={!enabled} />
        {enabled && <DropdownMenu onSelected={onSelectedHandler}>
            {umiAcceptable && <>
                <li><h6 className="dropdown-header">Send as Playlist to</h6></li>
                {umis.map(({ udn, name }) => renderActionMenuItem(udn, "send", name))}
            </>}
            {(umiAcceptable || rendererAcceptable) && <>
                <li><h6 className="dropdown-header">Play on</h6></li>
                {umiAcceptable && umis.map(({ udn, name }) => renderActionMenuItem(udn, "play", name))}
                {rendererAcceptable && renderers.map(({ udn, name }) => renderActionMenuItem(udn, "play", name))}
            </>}
        </DropdownMenu>}
    </>
}