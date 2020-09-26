import React from "react";
import $api from "../../../components/WebApi";
import Modal from "../../../components/Modal";
import $config from "../../common/Config";
import { TextValueEditDialog } from "../../../components/Dialogs";
import { withBrowser } from "../../common/BrowserUtils";
import BrowserDialog from "../../common/BrowserDialog";
import Toolbar from "../../../components/Toolbar";
import Pagination from "../../common/Pagination";
import Breadcrumb from "../../common/Breadcrumb";
import BrowserCore from "../../common/BrowserCoreSelectable";
import AlbumArt from "../../common/AlbumArt";
import LoadIndicator from "../../../components/LoadIndicator";
import SelectionService from "../../../components/SelectionService";
import { SignalRListener } from "../../../components/SignalR";

export class PlaylistManagerCore extends React.Component {

    displayName = PlaylistManagerCore.name;

    constructor(props) {
        super(props);
        this.selection = new SelectionService();
        this.selection.addEventListener("changed", () => this.setState({ selection: this.selection }));
        this.handlers = new Map([["AVTransportEvent", this.onAVTransportEvent]]);
        this.state = { modal: null, selection: this.selection };
        this.ctrl = $api.control(this.props.device);
    }

    async componentDidUpdate(prevProps) {
        if (prevProps.device !== this.props.device) {
            this.ctrl = $api.control(this.props.device);
        }
        if (prevProps.dataContext !== this.props.dataContext) {
            this.selection.reset();
        }
    }

    async componentDidMount() {
        try {
            let response = await this.ctrl.state(true).fetch();
            const { actions, currentTrackMetadata: current, state, medium } = await response.json();
            if (medium === "X-MI-AUX") {
                this.setState({ actions, current, playbackState: state, playlist: "aux", track: null });
            } else {
                response = await this.ctrl.playlistState().fetch();
                const { "playlist_transport_uri": playlist } = await response.json();
                response = await this.ctrl.position().fetch();
                const { track } = await response.json();
                this.setState({ actions, current, playbackState: state, playlist, track: parseInt(track) });
            }
        } catch (e) {
            console.error(e);
        }
    }

    onAVTransportEvent = (device, message) => {
        const {
            state: { actions, currentTrackMetadata: current, currentTrack: track, state },
            vendor: { "mi:playlist_transport_uri": playlist, "mi:Transport": transport }
        } = message;

        if (device === this.props.device) {
            this.setState({ actions, current, playbackState: state, playlist: transport === "AUX" ? "aux" : playlist, track: parseInt(track) });
        }
    }

    static isEditable = (item) => !item.readonly;

    resetModal = () => { this.setState({ modal: null }); }

    reload = () => { this.props.dataContext.reload(); }

    renamePlaylist = (id, title) => $api.playlist(this.props.device).rename(id, title).fetch();

    createPlaylist = (title) => $api.playlist(this.props.device).create(title).fetch();

    removePlaylist = (ids) => $api.playlist(this.props.device).delete(ids).fetch();

    addItems = (device, ids) => $api.playlist(this.props.device).addItems(this.props.id, device, ids).fetch();

    removeItems = (ids) => $api.playlist(this.props.device).removeItems(this.props.id, ids).fetch();

    onCreate = () => {
        const input = React.createRef();
        this.setState({
            modal:
                <TextValueEditDialog id="create_confirm" inputRef={input} title="Create new playlist" label="Name" confirmText="Create"
                    defaultValue="New Playlist" onConfirm={() => this.createPlaylist(input.current.value).then(this.reload)}
                    onDismiss={this.resetModal} immediate />
        });
    }

    onDelete = () => {

        const ids = [...this.selection.keys];
        const values = this.props.dataContext.source.result.filter(e => ids.includes(e.id));

        this.setState({
            modal: <Modal id="remove_confirm" title="Do you want to delete playlist?" onDismiss={this.resetModal} immediate>
                <ul className="list-unstyled">
                    {[values.map((e, i) => <li key={i}>{e.title}</li>)]}
                </ul>
                <Modal.Footer>
                    <Modal.Button text="Cancel" className="btn-secondary" dismiss />
                    <Modal.Button text="Delete" className="btn-danger" icon="trash" onClick={() => this.removePlaylist(ids).then(this.reload)} dismiss />
                </Modal.Footer>
            </Modal>
        });
    }

    onRename = () => {
        const id = this.selection.keys.next().value;
        const title = this.props.dataContext.source.result.find(e => e.id === id).title;
        const input = React.createRef();

        this.setState({
            modal: <TextValueEditDialog id="rename_confirm" inputRef={input} title="Rename playlist" label="Name" confirmText="Rename"
                defaultValue={title} onConfirm={() => this.renamePlaylist(id, input.current.value).then(this.reload)}
                onDismiss={this.resetModal} immediate />
        });
    }

    onAddItems = () => {
        this.setState({
            modal:
                <BrowserDialog id="browse_dialog" title="Select items to add" className="modal-lg modal-vh-80" onDismiss={this.resetModal} immediate>
                    {b => [
                        b.selection.any() &&
                        <button type="button" key="counter" className="btn btn-link text-decoration-none mr-auto px-0"
                            onClick={b.selection.clear}>
                            Clear selection
                        </button>,
                        <Modal.Button key="close" text="Close" className="btn-secondary" dismiss />,
                        <Modal.Button key="add" className="btn-primary" icon="plus" disabled={b.selection.none()}
                            onClick={() => this.addItems(...b.getSelectionData()).then(b.selection.clear).then(this.reload)}>
                            Add{b.selection.any() && <span className="badge badge-light ml-1">{b.selection.length}</span>}
                        </Modal.Button>
                    ]}
                </BrowserDialog>
        });
    }

    onRemoveItems = () => {
        const ids = [...this.selection.keys];
        const values = this.props.dataContext.source.result.filter(e => ids.includes(e.id));

        this.setState({
            modal:
                <Modal id="remove_items_confirm" title="Do you want to remove items from playlist?" className="modal-vh-80" onDismiss={this.resetModal} immediate>
                    <ul className="list-unstyled">
                        {[values.map((e, i) => <li key={i}>{e.title}</li>)]}
                    </ul>
                    <Modal.Footer>
                        <Modal.Button text="Cancel" className="btn-secondary" dismiss />
                        <Modal.Button text="Remove" className="btn-danger" icon="trash" onClick={() => this.removeItems(ids).then(this.reload)} dismiss />
                    </Modal.Footer>
                </Modal>
        });
    }

    onCopy = () => { alert("not implemented yet"); };

    render() {

        const { dataContext: data, match, navigate, id, s: size, p: page } = this.props;
        const { source: { total = 0, result: { length: fetched = 0 } = {}, parents } = {} } = data || {};
        const disabled = this.selection.none();
        const cellContext = {
            ctrl: this.ctrl,
            state: this.state.playbackState,
            parents,
            active: id !== "PL:"
                ? (_, index) => index + 1 === this.state.track
                : (this.state.playlist === "aux"
                    ? d => d.vendor["mi:playlistType"] === "aux"
                    : d => d.res.url === this.state.playlist)
        };
        return <div className="d-flex flex-column h-100">
            <div className="position-sticky sticky-top">
                <Breadcrumb items={parents} {...match} />
                <Toolbar className="px-2 py-1 bg-light shadow-sm">
                    {id === "PL:"
                        ? <Toolbar.Group>
                            <Toolbar.Button title="Create" glyph="plus" onClick={this.onCreate} />
                            <Toolbar.Button title="Delete" glyph="trash" onClick={this.onDelete} disabled={disabled} />
                            <Toolbar.Button title="Rename" glyph="edit" onClick={this.onRename} disabled={disabled} />
                            <Toolbar.Button title="Copy" glyph="copy" onClick={this.onCopy} disabled={disabled} />
                        </Toolbar.Group>
                        : <Toolbar.Group>
                            <Toolbar.Button title="Add items" glyph="plus" onClick={this.onAddItems} />
                            <Toolbar.Button title="Remove items" glyph="trash" onClick={this.onRemoveItems} disabled={disabled} />
                        </Toolbar.Group>}
                </Toolbar>
            </div>
            <SignalRListener handlers={this.handlers}>
                <BrowserCore dataContext={data} cellTemplate={MainCellTemplate} cellContext={cellContext}
                    filter={PlaylistManagerCore.isEditable} navigate={navigate} selection={this.selection} />
            </SignalRListener>
            {!data && <LoadIndicator />}
            <Pagination {...match} className="position-sticky sticky-bottom shadow-sm"
                count={fetched} total={total} current={parseInt(page) || 1} size={parseInt(size) || $config.pageSize} />
            {this.state.modal && (typeof this.state.modal === "function" ? this.state.modal() : this.state.modal)}
        </div>;
    }
}

const MainCellTemplate = ({ data, context: { ctrl, active, parents, state }, index }) => {
    const isActive = active(data, index);
    return <div className="d-flex align-items-center">
        <div className="d-inline-block stack mr-1">
            <AlbumArt itemClass={data.class} albumArts={data.albumArts} />
            {isActive
                ? state === "PLAYING"
                    ? <React.Fragment key="active-playing">
                        <div className="stack-layer d-flex">
                            <i className="m-auto fas fa-lg fa-volume-up animate-pulse" />
                        </div>
                        <div className="stack-layer stack-layer-hover d-flex" onClick={ctrl.pause().fetch}>
                            <i className="m-auto fas fa-lg fa-pause-circle" />
                        </div>
                    </React.Fragment>
                    : <React.Fragment key="active-paused">
                        <div className="stack-layer d-flex">
                            <i className="m-auto fas fa-lg fa-volume-off text-muted" />
                        </div>
                        <div className="stack-layer stack-layer-hover d-flex" onClick={ctrl.play().fetch}>
                            <i className="m-auto fas fa-lg fa-play-circle" />
                        </div>
                    </React.Fragment>
                : <div className="stack-layer stack-layer-hover d-flex"
                    onClick={ctrl.playUri(parents[0].url ? `${parents[0].url}#tracknr=${index + 1},play` : data.res.url).fetch}>
                    <i className="m-auto fas fa-lg fa-play-circle" />
                </div>}
        </div>
        <div className={isActive ? "text-primary" : null}>
            {data.title}
            {data.creator && <small>&nbsp;&bull;&nbsp;{data.creator}</small>}
            {data.album && <small>&nbsp;&bull;&nbsp;{data.album}</small>}
        </div>
    </div>;
};

export default withBrowser(PlaylistManagerCore, false,
    ({ device, id, p, s }) => {
        const page = parseInt(p) || 1;
        const size = parseInt(s) || $config.playlist.pageSize;
        return $api.browse(device).get(id || "PL:").withParents().withResource().withVendor().take(size).skip((page - 1) * size).url();
    });