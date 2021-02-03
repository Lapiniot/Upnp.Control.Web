import React from "react";
import { MenuItem } from "../../components/DropdownMenu";
import WebApi from "../../components/WebApi";
import BrowserCore, { BrowserCoreProps } from "./BrowserCore";
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

    menuSelectedHandler = async ({ dataset: { action, udn } }: HTMLElement, anchor?: HTMLElement) => {
        const { dataContext, device } = this.props;

        if (!anchor || !device) return;

        if (action?.startsWith("send-") && udn) {
            const item = dataContext?.source.items.find(i => i.id === anchor.dataset.id);
            if (!item) return;

            this.setState({ fetching: true, error: null });
            try {
                await WebApi.playlist(udn).createFromItems(item.title, device, [item.id]).fetch();
                this.setState({ fetching: false });
            }
            catch (error) {
                this.setState({ fetching: false, error: error });
            }
        }
    }

    renderContextMenu = (anchor?: HTMLElement | null) => {
        const id = anchor?.dataset.id;
        if (!id) return;
        const item = this.props.dataContext?.source.items.find(i => i.id === id);
        if (!item) return;
        return <>{item.container
            ? <>{this.state.devices?.filter(d => d.services.some(s => s.type.startsWith(Services.UmiPlaylist))).map(d =>
                <MenuItem key={d.udn} action={"send-" + d.udn} data-udn={d.udn}>Send as Playlist to <span className="text-bolder">&laquo;{d.name}&raquo;</span></MenuItem>)}
                <li><hr className="dropdown-divider mx-2" /></li></>
            : <>{this.state.devices?.map(d =>
                <MenuItem key={d.udn} action={"play-" + d.udn} data-udn={d.udn}>Play on <span className="text-bolder">&laquo;{d.name}&raquo;</span></MenuItem>)}
                <li><hr className="dropdown-divider mx-2" /></li></>}
            <MenuItem action={"info"}>Get Info</MenuItem>
        </>;
    }

    render() {
        return <>
            <BrowserCore mainCellTemplate={Template} mainCellContext={{ disabled: !this.state.devices }}
                useCheckboxes multiSelect rowState={this.rowState} selectionChanged={this.selectionChanged}
                {...this.props} fetching={this.state.fetching || this.props.fetching}>
                <BrowserView.ContextMenu render={this.renderContextMenu} onSelected={this.menuSelectedHandler} />
            </BrowserCore>
            <div className="float-container bottom-0 end-0" style={{ marginBlockEnd: "4rem" }}>
                <button type="button" className="btn btn-lg btn-round btn-primary" disabled={!this.state.selection?.length}>
                    <svg className="icon"><use href="#ellipsis-v" /></svg>
                </button>
            </div>
        </>;
    }
}