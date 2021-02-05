import React from "react";
import { DropdownMenu, MenuItem } from "../../components/DropdownMenu";
import WebApi from "../../components/WebApi";
import BrowserCore, { BrowserCoreProps } from "./BrowserCore";
import { DIDLUtils } from "./BrowserUtils";
import BrowserView, { CellTemplate, CellTemplateProps, RowState } from "./BrowserView";
import settings from "./Config";
import { Services, UpnpDevice } from "./Types";

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
    devices: UpnpDevice[] | null;
    selection: string[] | null;
    fetching: boolean;
    error: Error | null;
};

export class Browser extends React.Component<BrowserCoreProps<CellContext> & { device?: string }, BrowserState> {

    state: BrowserState = { devices: null, selection: null, fetching: false, error: null }

    async componentDidMount() {
        try {
            const devices: UpnpDevice[] = await WebApi.devices("renderers").jsonFetch(settings.get("timeout"));
            this.setState({ devices })
        }
        catch (error) {
            console.error(error);
        }
    }

    rowState = () => RowState.Selectable | RowState.Navigable;

    selectionChanged = (ids: string[]) => {
        this.setState({ selection: ids });
        return false;
    }

    itemMenuSelectedHandler = async ({ dataset: { action, udn } }: HTMLElement, anchor?: HTMLElement) => {
        const { dataContext, device } = this.props;

        if (!action || !anchor || !device || !dataContext?.source) return;

        if (action.startsWith("send-") && udn) {
            const item = dataContext.source.items.find(i => i.id === anchor.dataset.id);
            if (!item) return;

            this.setState({ fetching: true, error: null });
            try {
                await WebApi.playlist(udn).createFromItems(item.title, device, [item.id]).fetch();
                this.setState({ fetching: false });
            }
            catch (error) {
                console.error(error);
                this.setState({ fetching: false, error: error });
            }
        }
        else if (action?.startsWith("play-") && udn) {
            const item = dataContext.source.items.find(i => i.id === anchor.dataset.id);
            if (!item) return;

            try {
                await WebApi.control(udn).play(item.id, device).fetch();
            }
            catch (error) {
                console.error(error);
            }
        }
    }

    actionMenuSelectedHandler = async ({ dataset: { action, udn } }: HTMLElement, anchor?: HTMLElement) => {
        const { dataContext, device } = this.props;

        if (!action || !anchor || !device || !dataContext?.source || !this.state.selection) return;

        if (action.startsWith("send-") && udn) {
            this.setState({ fetching: true, error: null });
            try {
                const items = this.state.selection.map(id => dataContext.source.items.find(i => i.id === id));
                const title = items?.map(i => i?.title).join(";");
                await WebApi.playlist(udn).createFromItems(title, device, items.map(i => i?.id ?? "")).fetch();
                this.setState({ fetching: false });
            }
            catch (error) {
                console.error(error);
                this.setState({ fetching: false, error: error });
            }
        }
        else if (action.startsWith("play-") && udn) {
            const item = this.getSelectedMusicTrack();
            if (!item) return;
            try {
                await WebApi.control(udn).play(item.id, device).fetch();
            }
            catch (error) {
                console.error(error);
            }
        }
    }

    renderItemMenu = (anchor?: HTMLElement | null) => {
        const id = anchor?.dataset.id;
        if (!id) return;
        const item = this.props.dataContext?.source.items.find(i => i.id === id);
        if (!item) return;

        const prefix = item.container ? "send" : "play";
        const caption = item.container ? "Send as Playlist to" : "Play on";
        const devices = item.container
            ? this.state.devices?.filter(isUmiDevice)
            : DIDLUtils.isMusicTrack(item)
                ? this.state.devices
                : this.state.devices?.filter(d => !isUmiDevice(d));

        return <>
            {!!devices?.length && <>
                <li><h6 className="dropdown-header">{caption}</h6></li>
                {devices?.map(({ udn, name }) => this.createMenuItem(udn, prefix, name))}
                <li><hr className="dropdown-divider mx-2" /></li>
            </>}
            <MenuItem action={"info"}>Get Info</MenuItem>
        </>;
    }

    renderActionMenu = () => {
        var track = this.getSelectedMusicTrack();
        const umiDevices = this.state.devices?.filter(isUmiDevice);
        return <>
            {!!track && <>
                <li><h6 className="dropdown-header">Play on</h6></li>
                {this.state.devices?.map(({ udn, name }) => this.createMenuItem(udn, "play", name))}
            </>}
            {!!umiDevices?.length && <>
                <li><h6 className="dropdown-header">Send as Playlist to</h6></li>
                {umiDevices.map(({ udn, name }) => this.createMenuItem(udn, "send", name))}
            </>}
        </>;
    }

    private getSelectedMusicTrack() {
        return this.props.dataContext?.source.items.find(i =>
            !i.container && DIDLUtils.isMusicTrack(i) && this.state.selection?.some(id => id === i.id));
    }

    private createMenuItem(udn: string, action: string, name: string): JSX.Element {
        return <MenuItem key={`${action}-${udn}`} action={`${action}-${udn}`} data-udn={udn}>&laquo;{name}&raquo;</MenuItem>;
    }

    render() {
        return <>
            <BrowserCore mainCellTemplate={Template} mainCellContext={{ disabled: !this.state.devices }}
                useCheckboxes multiSelect rowState={this.rowState} selectionChanged={this.selectionChanged}
                {...this.props} fetching={this.state.fetching || this.props.fetching}>
                <BrowserView.ContextMenu render={this.renderItemMenu} onSelected={this.itemMenuSelectedHandler} />
            </BrowserCore>
            <div className="float-container bottom-0 end-0" style={{ marginBlockEnd: "4rem" }}>
                <button type="button" className="btn btn-lg btn-round btn-primary" data-bs-toggle="dropdown"
                    disabled={!this.state.selection?.length || !this.state.devices?.length}>
                    <svg className="icon"><use href="#ellipsis-v" /></svg>
                </button>
            </div>
            <DropdownMenu render={this.renderActionMenu} onSelected={this.actionMenuSelectedHandler} placement="top-end" />
        </>;
    }
}

function isUmiDevice(device: UpnpDevice) {
    return device.services.some(s => s.type.startsWith(Services.UmiPlaylist));
}