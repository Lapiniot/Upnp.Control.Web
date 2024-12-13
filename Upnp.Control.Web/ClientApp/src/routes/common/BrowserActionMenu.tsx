import { ChangeEvent, FormHTMLAttributes, useCallback, useEffect, useState } from "react";
import { Form } from "../../components/Form";
import { Menu, MenuItem } from "../../components/Menu";
import { useRowStates } from "../../components/RowStateContext";
import Toolbar from "../../components/Toolbar";
import { useSearchParams } from "../../hooks/Navigator";
import WebApi from "../../services/WebApi";
import { isContainer, isMediaItem, isMusicTrack } from "./DIDLTools";

export function renderActionMenuItem(udn: string, action: string, name: string) {
    return <MenuItem key={`${action}.${udn}`} action={`${action}.${udn}`} data-udn={udn}>&laquo;{name}&raquo;</MenuItem>;
}

type BrowserActionMenuProps = {
    umis: Upnp.Device[];
    renderers: Upnp.Device[];
    device: string;
    onSelected?: (action: string, udn: string, selection: Upnp.DIDL.Item[]) => void;
};

export function BrowserActions({ umis, renderers, device, onSelected }: BrowserActionMenuProps) {
    const { selection, dispatch } = useRowStates();
    const [searchSupported, setSearchSupported] = useState(false);

    const umiAcceptable = selection.some(i => isContainer(i) || isMusicTrack(i));
    const rendererAcceptable = selection.some(isMediaItem);
    const enabled = umiAcceptable || rendererAcceptable;

    const onSelectedHandler = ({ dataset: { action, udn } }: HTMLElement) => {
        onSelected?.(action as string, udn as string, selection);
        dispatch({ type: "SET_ALL", selected: false });
    }

    useEffect(() => {
        WebApi.browse(device).searchCapabilities().json().then(r => setSearchSupported(r instanceof Array && r.length > 0))
    }, [device]);

    return <>
        {searchSupported ? <SearchView className="topbar-search" /> : undefined}
        <Toolbar.Button icon="symbols.svg#more_vert" popoverTarget="browser-actions"
            className="btn-icon" disabled={!enabled} />
        {enabled && <Menu id="browser-actions" activation="explicit" className="drop-bottom" onSelected={onSelectedHandler}>
            {umiAcceptable && <>
                <li><h6 className="dropdown-header">Send as Playlist to</h6></li>
                {umis.map(({ udn, name }) => renderActionMenuItem(udn, "send", name))}
            </>}
            {(umiAcceptable || rendererAcceptable) && <>
                <li><h6 className="dropdown-header">Play on</h6></li>
                {umiAcceptable && umis.map(({ udn, name }) => renderActionMenuItem(udn, "play", name))}
                {rendererAcceptable && renderers.map(({ udn, name }) => renderActionMenuItem(udn, "play", name))}
            </>}
        </Menu>}
    </>
}

function SearchView({ children, ...props }: FormHTMLAttributes<Omit<HTMLFormElement, "method">>) {
    const [params] = useSearchParams();
    const query = params.get("q") ?? "";
    const [value, setValue] = useState(query);
    useEffect(() => setValue(query), [query]);
    const onChange = useCallback(({ target: { value } }: ChangeEvent<HTMLInputElement>) => setValue(value), []);
    return <>
        <Toolbar.ToggleButton icon="symbols.svg#search" active={query !== ""} className="search-toggle d-flex d-sm-none" />
        <Form {...props} method="GET">
            <input type="search" name="q" className="form-control form-control-sm flex-1 rounded-pill" placeholder="Search"
                value={value} onChange={onChange} />
            {children}
        </Form>
    </>
}
