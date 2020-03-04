import React from "react";
import $api from "../../../components/WebApi";
import Modal from "../../../components/Modal";
import { TextValueEditDialog } from "../../../components/Dialogs";
import { withBrowserCore } from "../../common/BrowserCore";
import BrowserDialog from "../../common/BrowserDialog";
import Toolbar from "../../../components/Toolbar";
import Pagination from "../../common/Pagination";
import BrowserCore from "../../common/BrowserWithSelection";
import LoadIndicator from "../../../components/LoadIndicator";

export default class PlaylistManager extends React.Component {

    displayName = PlaylistManager.name;

    constructor(props) {
        super(props);
        this.state = { data: null, modal: null, selection: null };
    }

    static getDerivedStateFromProps(props, state) {
        if (state.data !== props.dataContext) {
            return { data: props.dataContext, selection: null, modal: null };
        }
        return null;
    }

    static isEditable(item) {
        return !item.readonly;
    }

    resetModalState = () => this.setState({ modal: null });

    reload() { this.props.dataContext.reload(); }

    wrap = (requestInvoker) => {
        return async (...args) => {
            try {
                await requestInvoker(...args);
            } catch (e) {
                console.error(e);
            } finally {
                this.reload();
            }
        };
    }

    renamePlaylist = (id, title) => $api.playlist(this.props.device).rename(id, title).fetch();

    createPlaylist = (title) => $api.playlist(this.props.device).create(title).fetch();

    removePlaylist = (ids) => $api.playlist(this.props.device).delete(ids).fetch();

    addItems = (device, ids) => $api.playlist(this.props.device).addItems(this.props.id, device, ids).fetch();

    removeItems = (ids) => $api.playlist(this.props.device).removeItems(this.props.id, ids).fetch();

    onCreate = () => {
        const input = React.createRef();
        this.setState({
            modal: <TextValueEditDialog id="create_confirm" inputRef={input} title="Create new playlist" label="Name" confirmText="Create"
                defaultValue="New Playlist" onConfirm={this.wrap(() => this.createPlaylist(input.current.value))} immediate />
        });
    }

    onDelete = () => {

        const ids = [...this.state.selection.keys];
        const values = this.state.data.source.result.filter(e => ids.includes(e.id));

        this.setState({
            modal: <Modal id="remove_confirm" title="Do you want to delete playlist?" immediate>
                <ul className="list-unstyled">
                    {[values.map((e, i) => <li key={i}>{e.title}</li>)]}
                </ul>
                <Modal.Footer>
                    <Modal.Button text="Cancel" className="btn-secondary" dismiss />
                    <Modal.Button text="Delete" className="btn-danger" icon="trash" onClick={this.wrap(() => this.removePlaylist(ids))} dismiss />
                </Modal.Footer>
            </Modal>
        });
    }

    onRename = () => {
        const id = this.state.selection.keys.next().value;
        let title = this.state.data.source.result.find(e => e.id === id).title;
        const input = React.createRef();

        this.setState({
            modal: <TextValueEditDialog id="rename_confirm" inputRef={input} title="Rename playlist" label="Name" confirmText="Rename"
                defaultValue={title} onConfirm={this.wrap(() => this.renamePlaylist(id, input.current.value))} immediate />
        });
    }

    onAddItems = () => {
        const addItems = this.wrap(({ device, keys }) => this.addItems(device, keys));
        this.setState({
            modal: <BrowserDialog key="add_items_dialog" id="browse_dialog" title="Select items to add" className="modal-lg modal-vh-80" immediate >
                {browser => [
                    browser.hasSelection() && <i key="counter" className="mr-auto">{browser.getSelection().keys.length} item(s) selected</i>,
                    <Modal.Button key="cancel" text="Cancel" className="btn-secondary" dismiss />,
                    <Modal.Button key="add" className="btn-primary" icon="plus" disabled={!browser.hasSelection()}
                        onClick={() => addItems(browser.getSelection())}>Add</Modal.Button>
                ]}
            </BrowserDialog>
        })
    }

    onRemoveItems = () => {
        const ids = [...this.state.selection.keys];
        const values = this.state.data.source.result.filter(e => ids.includes(e.id));

        this.setState({
            modal: <Modal id="remove_items_confirm" title="Do you want to remove items from playlist?" className="modal-vh-80" immediate >
                <ul className="list-unstyled">
                    {[values.map((e, i) => <li key={i}>{e.title}</li>)]}
                </ul>
                <Modal.Footer>
                    <Modal.Button text="Cancel" className="btn-secondary" dismiss />
                    <Modal.Button text="Remove" className="btn-danger" icon="trash" onClick={this.wrap(() => this.removeItems(ids))} dismiss />
                </Modal.Footer>
            </Modal>
        });
    }

    onCopy = () => { alert("not implemented yet"); };

    onSelectionChanged = (selection) => {
        this.setState({ selection: selection });
        return true;
    }

    render() {

        const { source: { total = 0, result: { length: fetched = 0 } = {} } = {} } = this.state.data || {};
        const { id, navContext: { navigateHandler, page, pageSize, urls } } = this.props;

        const selection = this.state.selection;
        const noSelection = !selection || !selection.any();

        return <div className="d-flex flex-column h-100">
            <Toolbar className="position-sticky sticky-top px-2 py-1 bg-light shadow-sm">
                {id === "PL:"
                    ? <Toolbar.Group>
                        <Toolbar.Button title="Create" glyph="plus" onClick={this.onCreate} />
                        <Toolbar.Button title="Delete" glyph="trash" onClick={this.onDelete} disabled={noSelection} />
                        <Toolbar.Button title="Rename" glyph="edit" onClick={this.onRename} disabled={!selection || !selection.one()} />
                        <Toolbar.Button title="Copy" glyph="copy" onClick={this.onCopy} disabled={noSelection} />
                    </Toolbar.Group>
                    : <Toolbar.Group>
                        <Toolbar.Button title="Add items" glyph="plus" onClick={this.onAddItems} />
                        <Toolbar.Button title="Remove items" glyph="trash" onClick={this.onRemoveItems} disabled={noSelection} />
                    </Toolbar.Group>}
            </Toolbar>
            {
                this.state.data ?
                    <BrowserCore dataContext={this.state.data} filter={PlaylistManager.isEditable} navigateHandler={navigateHandler} onSelectionChanged={this.onSelectionChanged} /> :
                    <LoadIndicator />
            }
            <Pagination count={fetched} total={total} baseUrl={urls.current} current={page} size={pageSize} className="shadow-sm" />
            {this.state.modal && (typeof this.state.modal === "function" ? this.state.modal() : this.state.modal)}
        </div>;
    }
}

export const RoutedPlaylistManager = withBrowserCore(PlaylistManager, false);