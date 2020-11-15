import React from "react";
import $api from "../../../components/WebApi";
import Modal from "../../../components/Modal";
import $config from "../../common/Config";
import { TextValueEditDialog } from "../../../components/Dialogs";
import { withBrowser, fromBaseQuery } from "../../common/BrowserUtils";
import BrowserDialog from "../../common/BrowserDialog";
import Toolbar from "../../../components/Toolbar";
import Pagination from "../../common/Pagination";
import Breadcrumb from "../../common/Breadcrumb";
import Browser from "../../common/BrowserCore";
import { LoadIndicatorOverlay } from "../../../components/LoadIndicator";
import SelectionService from "../../../components/SelectionService";
import { SignalRListener } from "../../../components/SignalR";
import MainCell from "./CellTemplate";

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
        if (prevProps.device !== this.props.device || prevProps.id !== this.props.id) {
            this.selection.reset();
        }
    }

    async componentDidMount() {
        try {
            const response = await this.ctrl.state(true).fetch();
            const { actions, currentTrackMetadata: current, state, medium } = await response.json();
            if (medium === "X-MI-AUX") {
                this.setState({ actions, current, playbackState: state, playlist: "aux", track: null });
            } else {
                const { 0: { "playlist_transport_uri": playlist }, 1: { track } } = await Promise.all([
                    await (await this.ctrl.playlistState().fetch()).json(),
                    await (await this.ctrl.position().fetch()).json()
                ]);
                this.setState({ actions, current, playbackState: state, playlist, track: parseInt(track) });
            }
        } catch (e) {
            console.error(e);
        }
    }

    onAVTransportEvent = (device, { state: { actions, currentTrackMetadata: current, currentTrack: track, state } = {},
        vendorProps: { "mi:playlist_transport_uri": playlist, "mi:Transport": transport } = {} }) => {
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

    onAdd = () => {
        this.setState({
            modal: <TextValueEditDialog id="create-confirm" title="Create new playlist" label="Name" confirmText="Create"
                defaultValue="New Playlist" onConfirm={value => this.createPlaylist(value).then(this.reload)}
                onDismiss={this.resetModal} immediate />
        });
    }

    onRemove = () => {

        const ids = [...this.selection.keys];
        const values = this.props.dataContext.source.items.filter(e => ids.includes(e.id));

        this.setState({
            modal: <Modal id="remove-confirm" title="Do you want to delete playlist(s)?" onDismiss={this.resetModal} immediate>
                <ul className="list-unstyled">
                    {[values.map((e, i) => <li key={i}>{e.title}</li>)]}
                </ul>
                <Modal.Footer>
                    <Modal.Button className="btn-secondary" dismiss>Cancel</Modal.Button>
                    <Modal.Button className="btn-danger" icon="trash" onClick={() => this.removePlaylist(ids).then(this.selection.reset).then(this.reload)} dismiss>Delete</Modal.Button>
                </Modal.Footer>
            </Modal>
        });
    }

    onRename = () => {
        const id = this.selection.keys.next().value;
        const title = this.props.dataContext.source.items.find(e => e.id === id).title;

        this.setState({
            modal: <TextValueEditDialog id="rename-confirm" title="Rename playlist" label="Name" confirmText="Rename"
                defaultValue={title} onConfirm={value => this.renamePlaylist(id, value).then(this.reload)}
                onDismiss={this.resetModal} immediate />
        });
    }

    onAddItems = () => {
        this.setState({
            modal:
                <BrowserDialog id="add-items-confirm" title="Select items to add" className="modal-lg modal-vh-80" onDismiss={this.resetModal} immediate>
                    {b => [
                        b.selection.any() &&
                        <button type="button" key="counter" className="btn btn-link text-decoration-none mr-auto px-0"
                            onClick={b.selection.clear}>
                            Clear selection
                        </button>,
                        <Modal.Button key="close" className="btn-secondary" dismiss>Close</Modal.Button>,
                        <Modal.Button key="add" className="btn-primary" icon="plus" disabled={b.selection.none()}
                            onClick={() => this.addItems(...b.getSelectionData()).then(b.selection.clear).then(this.reload)}>
                            Add{b.selection.any() && <span className="badge ml-1 bg-secondary">{b.selection.length}</span>}
                        </Modal.Button>
                    ]}
                </BrowserDialog>
        });
    }

    onRemoveItems = () => {
        const ids = [...this.selection.keys];
        const values = this.props.dataContext.source.items.filter(e => ids.includes(e.id));

        this.setState({
            modal:
                <Modal id="remove-items-confirm" title="Do you want to remove items from playlist?" className="modal-vh-80" onDismiss={this.resetModal} immediate>
                    <ul className="list-unstyled">
                        {[values.map((e, i) => <li key={i}>{e.title}</li>)]}
                    </ul>
                    <Modal.Footer>
                        <Modal.Button className="btn-secondary" dismiss>Cancel</Modal.Button>
                        <Modal.Button className="btn-danger" icon="trash" onClick={() => this.removeItems(ids).then(this.reload)} dismiss>Remove</Modal.Button>
                    </Modal.Footer>
                </Modal>
        });
    }

    onCopy = () => { alert("not implemented yet"); };

    play = () => this.ctrl.play().fetch();

    pause = () => this.ctrl.pause().fetch();

    playUrl = ({ currentTarget: { dataset: { playUrl } } }) => this.ctrl.playUri(playUrl).fetch();

    render() {

        const { dataContext: data, match, navigate, id, s: size, p: page, fetching } = this.props;
        const { source: { total = 0, items: { length: fetched = 0 } = {}, parents } = {} } = data || {};
        const disabled = this.selection.none();
        const cellContext = {
            play: this.play,
            pause: this.pause,
            playUrl: this.playUrl,
            state: this.state.playbackState,
            parents,
            active: id !== "PL:"
                ? (_, index) => index + 1 === this.state.track
                : (this.state.playlist === "aux"
                    ? d => d.vendor["mi:playlistType"] === "aux"
                    : d => d.res.url === this.state.playlist)
        };

        const toolbar = id === "PL:" ?
            [
                { key: "pl-create", title: "Create", glyph: "plus", onClick: this.onAdd },
                { key: "pl-delete", title: "Delete", glyph: "trash", onClick: this.onRemove, disabled: disabled },
                { key: "pl-rename", title: "Rename", glyph: "edit", onClick: this.onRename, disabled: !this.selection.one() },
                { key: "pl-copy", title: "Copy", glyph: "copy", onClick: this.onCopy, disabled: disabled }
            ] :
            [
                { key: "item-add", title: "Add items", glyph: "plus", onClick: this.onAddItems },
                { key: "item-remove", title: "Remove items", glyph: "trash", onClick: this.onRemoveItems, disabled: disabled }
            ];

        return <div className="d-flex flex-column h-100 position-relative">
            {fetching && <LoadIndicatorOverlay />}
            <div className="flex-grow-1">
                <SignalRListener handlers={this.handlers}>
                    <Browser dataContext={data} cellTemplate={MainCell} cellContext={cellContext}
                        filter={PlaylistManagerCore.isEditable} navigate={navigate} selection={this.selection}
                        useCheckboxes selectOnClick>
                        <Browser.Header className="p-0">
                            <div className="d-flex flex-column">
                                <Toolbar className="px-2 py-1 bg-light border-1 border-secondary border-bottom">
                                    <Toolbar.Group>
                                        {toolbar.map(i => <Toolbar.Button {...i} />)}
                                    </Toolbar.Group>
                                </Toolbar>
                                <Breadcrumb items={parents} path={match.path} params={match.params} />
                            </div>
                        </Browser.Header>
                    </Browser>
                </SignalRListener>
            </div>
            <div className="sticky-bottom">
                <div className="bg-light text-center text-muted small p-1">{
                    this.selection.length > 0
                        ? `${this.selection.length} of ${fetched} selected`
                        : `${fetched} item${fetched !== 1 ? "s" : ""}`}
                    , {total} totally available
                    </div>
                {total !== 0 && fetched !== total &&
                    <Pagination baseUrl={match.url} className="border-1 border-secondary border-top"
                        total={total} current={parseInt(page) || 1} pageSize={parseInt(size) || $config.pageSize} />}
            </div>
            {this.state.modal}
        </div>;
    }
}

const browsePlaylistsQueryBuilder = fromBaseQuery((device, id) => $api.browse(device).get(id || "PL:").withParents().withResource().withVendor());

export default withBrowser(PlaylistManagerCore, false, browsePlaylistsQueryBuilder);