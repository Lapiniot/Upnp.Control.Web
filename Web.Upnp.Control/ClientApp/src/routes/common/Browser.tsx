import React from "react";
import { MenuItem } from "../../components/DropdownMenu";
import WebApi from "../../components/WebApi";
import BrowserCore, { BrowserCoreProps } from "./BrowserCore";
import BrowserView, { CellTemplate, CellTemplateProps } from "./BrowserView";
import settings from "./Config";
import { Services, UpnpDevice } from "./Types";

type CellContext = {
    disabled?: boolean;
}

function Template(props: CellTemplateProps) {
    return <CellTemplate {...props}>
        <button type="button" className="btn btn-round" data-id={props.data.id}
            data-bs-toggle="dropdown" disabled={props.context?.disabled}>
            <svg><use href="#ellipsis-v" /></svg>
        </button>
    </CellTemplate>;
}

type BrowserState = {
    devices: UpnpDevice[] | null;
};

export class Browser extends React.Component<BrowserCoreProps, BrowserState> {

    state: BrowserState = { devices: null }

    async componentDidMount() {
        try {
            const devices: UpnpDevice[] = await WebApi.devices("renderers").jsonFetch(settings.get("timeout"));
            this.setState({ devices })
        }
        catch (error) {
            console.error(error);
        }
    }

    renderContextMenu = (anchor?: HTMLElement | null) => {
        const id = anchor?.dataset.id;
        if (!id) return;
        const item = this.props.dataContext?.source.items.find(i => i.id === id);
        if (!item) return;
        return <>{item.container
            ? <>{this.state.devices?.filter(d => d.services.some(s => s.type.startsWith(Services.UmiPlaylist))).map(d =>
                <MenuItem action={"send-" + d.udn} data-udn={d.udn}>Send as Playlist to <span className="text-bolder">&laquo;{d.name}&raquo;</span></MenuItem>)}
                <li><hr className="dropdown-divider mx-2" /></li></>
            : <>{this.state.devices?.map(d =>
                <MenuItem action={"play-" + d.udn} data-udn={d.udn}>Play on <span className="text-bolder">&laquo;{d.name}&raquo;</span></MenuItem>)}
                <li><hr className="dropdown-divider mx-2" /></li></>}
            <MenuItem action={"info"}>Get Info</MenuItem>
        </>;
    }

    render() {
        return <BrowserCore {...this.props} mainCellTemplate={Template} mainCellContext={{ disabled: !this.state.devices }}>
            <BrowserView.ContextMenu render={this.renderContextMenu} />
        </BrowserCore>;
    }
}