import React from "react";
import { DropdownMenu, MenuItem } from "../../components/DropdownMenu";
import WebApi from "../../components/WebApi";
import BrowserCore, { BrowserCoreProps } from "./BrowserCore";
import { DIDLUtils } from "./BrowserUtils";
import BrowserView, { CellTemplate, CellTemplateProps, RowState } from "./BrowserView";
import settings from "./Config";
import { DIDLItem, Services, UpnpDevice } from "./Types";

async function umiEnqueue(target: string, source: string, items: string[]) {
    const queues = WebApi.queues(target);
    const timeout = settings.get("timeout");
    await queues.clear("Q:0").fetch(timeout);
    await queues.enqueue("Q:0", source, items).fetch(settings.get("containerScanTimeout"));
    await WebApi.control(target).playUri("x-mi://sys/queue?id=0").fetch(timeout);
}

function umiCreatePlaylist(target: string, title: string, source: string, items: string[]) {
    return WebApi.playlist(target).createFromItems(title, source, items).fetch(settings.get("containerScanTimeout"));
}

function playItem(target: string, source: string, id: string) {
    return WebApi.control(target).play(id, source).fetch(settings.get("timeout"));
}

function isUmiDevice(device: UpnpDevice) {
    return device.services.some(s => s.type.startsWith(Services.UmiPlaylist));
}

type CellContext = {
    disabled?: boolean;
}

function Template(props: CellTemplateProps<CellContext>) {
    return <CellTemplate {...props}>
        <button type="button" className="btn btn-round btn-icon btn-primary" data-id={props.data.id}
            data-bs-toggle="dropdown" disabled={props.context?.disabled}>
            <svg><use href="#ellipsis-v" /></svg>
        </button>
    </CellTemplate>;
}

type BrowserState = {
    umis: UpnpDevice[];
    renderers: UpnpDevice[];
    selection: { items: DIDLItem[], umiCompatible: boolean, rendererCompatible: boolean };
    fetching: boolean;
    error: Error | null;
};

export class Browser extends React.Component<BrowserCoreProps<CellContext> & { device?: string }, BrowserState> {

    state: BrowserState = { umis: [], renderers: [], selection: { items: [], umiCompatible: false, rendererCompatible: false }, fetching: false, error: null }

    async componentDidMount() {
        try {
            const devices: UpnpDevice[] = await WebApi.devices("renderers").jsonFetch(settings.get("timeout"));
            this.setState({ umis: devices.filter(isUmiDevice), renderers: devices.filter(d => !isUmiDevice(d)) })
        }
        catch (error) {
            console.error(error);
        }
    }

    rowState = () => RowState.Selectable | RowState.Navigable;

    selectionChanged = (ids: string[]) => {
        const items = this.props.dataContext?.source.items.filter(i => ids.includes(i.id)) ?? [];
        this.setState({
            selection: {
                items,
                umiCompatible: items.some(i => DIDLUtils.isContainer(i) || DIDLUtils.isMusicTrack(i)),
                rendererCompatible: items.some(DIDLUtils.isMediaItem)
            }
        });
        return false;
    }

    itemMenuSelectedHandler = async ({ dataset: { action, udn } }: HTMLElement, anchor?: HTMLElement) => {
        const { dataContext, device } = this.props;

        if (!action || !anchor || !device || !dataContext?.source) return;

        if (udn) {
            const item = dataContext.source.items.find(i => i.id === anchor.dataset.id);

            if (!item) return;

            if (action.startsWith("send.")) {
                await this.createPlaylist(udn, item.title, device, [item.id]);
            }
            else if (action.startsWith("play.") && udn) {
                await this.playItems(udn, device, [item.id]);
            }
        }
    }

    actionMenuSelectedHandler = async ({ dataset: { action, udn } }: HTMLElement) => {
        const { dataContext, device } = this.props;

        if (!action || !device || !udn || !dataContext?.source || !this.state.selection) return;

        if (action.startsWith("send.")) {
            const items = this.getUmiCompatibleSelectedItems();
            const title = items?.map(i => i?.title).join(";");
            await this.createPlaylist(udn, title, device, items.map(i => i.id));
        }
        else if (action.startsWith("play.")) {
            await this.playItems(udn, device, this.getUmiCompatibleSelectedItems().map(i => i.id));
        }
    }

    renderItemMenuHandler = (anchor?: HTMLElement | null) => {
        const id = anchor?.dataset.id;
        if (!id) return;

        const { umis, renderers } = this.state;
        const { dataContext: ctx } = this.props;

        const item = ctx?.source.items.find(i => i.id === id);
        if (!item) return;

        const umiAcceptable = !!umis.length && (DIDLUtils.isContainer(item) || DIDLUtils.isMusicTrack(item));
        const rendererAcceptable = !!renderers.length && DIDLUtils.isMediaItem(item);

        return <>
            {this.renderMenu(umiAcceptable, rendererAcceptable, umis, renderers)}
            {(umiAcceptable || rendererAcceptable) &&
                <li><hr className="dropdown-divider mx-2" /></li>}
            <MenuItem action={"info"}>Get Info</MenuItem>
        </>;
    }

    renderActionMenuHandler = () => {
        const { selection: { umiCompatible, rendererCompatible }, umis, renderers } = this.state;
        return this.renderMenu(umiCompatible, rendererCompatible, umis, renderers);
    }

    private async playItems(target: string, source: string, items: string[]) {
        try {
            if (this.state.umis.some(d => d.udn === target)) {
                await umiEnqueue(target, source, items);
            }
            else {
                await playItem(target, source, items[0]);
            }
        }
        catch (error) {
            console.error(error);
        }
    }

    private async createPlaylist(target: string, title: string, source: string, items: string[]) {
        this.setState({ fetching: true, error: null });
        try {
            await umiCreatePlaylist(target, title, source, items);
            this.setState({ fetching: false });
        }
        catch (error) {
            console.error(error);
            this.setState({ fetching: false, error: error });
        }
    }

    private renderMenu(umiAcceptable: boolean, rendererAcceptable: boolean, umis: UpnpDevice[], renderers: UpnpDevice[]) {
        return [
            umiAcceptable && <>
                <li><h6 className="dropdown-header">Send as Playlist to</h6></li>
                {umis.map(({ udn, name }) => this.renderMenuItem(udn, "send", name))}
            </>,
            (umiAcceptable || rendererAcceptable) && <>
                <li><h6 className="dropdown-header">Play on</h6></li>
                {umiAcceptable && umis.map(({ udn, name }) => this.renderMenuItem(udn, "play", name))}
                {rendererAcceptable && renderers.map(({ udn, name }) => this.renderMenuItem(udn, "play", name))}
            </>];
    }

    private renderMenuItem(udn: string, action: string, name: string): JSX.Element {
        return <MenuItem key={`${action}.${udn}`} action={`${action}.${udn}`} data-udn={udn}>&laquo;{name}&raquo;</MenuItem>;
    }

    private getUmiCompatibleSelectedItems() {
        return this.state.selection.items.filter(i => DIDLUtils.isContainer(i) || DIDLUtils.isMusicTrack(i));
    }

    render() {
        const { selection: { umiCompatible, rendererCompatible }, umis, renderers } = this.state;
        const isActionButtonEnabled = (umis.length && umiCompatible) || (renderers.length && rendererCompatible);
        const isItemActionMenuEnabled = umis.length || renderers.length;

        return <>
            <BrowserCore mainCellTemplate={Template} mainCellContext={{ disabled: !isItemActionMenuEnabled }}
                useCheckboxes multiSelect rowState={this.rowState} selectionChanged={this.selectionChanged}
                {...this.props} fetching={this.state.fetching || this.props.fetching}>
                <BrowserView.ContextMenu render={this.renderItemMenuHandler} onSelected={this.itemMenuSelectedHandler} />
            </BrowserCore>
            <div className="float-container bottom-0 end-0" style={{ marginBlockEnd: "4rem" }}>
                <button type="button" className="btn btn-lg btn-round btn-primary" data-bs-toggle="dropdown" disabled={!isActionButtonEnabled}>
                    <svg className="icon"><use href="#ellipsis-v" /></svg>
                </button>
            </div>
            <DropdownMenu render={this.renderActionMenuHandler} onSelected={this.actionMenuSelectedHandler} placement="top-end" />
        </>;
    }
}
