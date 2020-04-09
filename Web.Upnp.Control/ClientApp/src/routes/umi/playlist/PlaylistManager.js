import React from "react";
import $api from "../../../components/WebApi";
import Modal from "../../../components/Modal";
import { TextValueEditDialog } from "../../../components/Dialogs";
import { withBrowserCore } from "../../common/BrowserCore";
import BrowserDialog from "../../common/BrowserDialog";
import Toolbar from "../../../components/Toolbar";
import Pagination from "../../common/Pagination";
import Breadcrumb from "../../common/Breadcrumb";
import BrowserCore from "../../common/BrowserWithSelection";
import LoadIndicator from "../../../components/LoadIndicator";
import SelectionService from "../../../components/SelectionService";

export default class PlaylistManager extends React.Component {

    displayName = PlaylistManager.name;

    constructor(props) {
        super(props);
        this.selection = new SelectionService();
        this.selection.addEventListener("changed", () => this.setState({ selection: this.selection }));
        this.state = { modal: null, selection: this.selection };
        this.resetModal = () => this.setState({ modal: null });
    }

    componentDidUpdate(prevProps) {
        if (prevProps.dataContext !== this.props.dataContext) {
            this.selection.reset();
        }
    }

    static isEditable = (item) => !item.readonly;

    reload = () => this.props.dataContext.reload();

    renamePlaylist = (id, title) => $api.playlist(this.props.device).rename(id, title).fetch();

    createPlaylist = (title) => $api.playlist(this.props.device).create(title).fetch();

    removePlaylist = (ids) => $api.playlist(this.props.device).delete(ids).fetch();

    addItems = (device, ids) => $api.playlist(this.props.device).addItems(this.props.id, device, ids).fetch();

    removeItems = (ids) => $api.playlist(this.props.device).removeItems(this.props.id, ids).fetch();

    onCreate = () => {
        const input = React.createRef();
        this.setState({
            modal: <TextValueEditDialog id="create_confirm" inputRef={input} title="Create new playlist" label="Name" confirmText="Create"
                defaultValue="New Playlist" onConfirm={() => this.createPlaylist(input.current.value).then(this.reload)} onDismiss={this.resetModal} immediate />
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
                defaultValue={title} onConfirm={() => this.renamePlaylist(id, input.current.value).then(this.reload)} onDismiss={this.resetModal} immediate />
        });
    }

    onAddItems = () => {
        this.setState({
            modal: <BrowserDialog id="browse_dialog" title="Select items to add" className="modal-lg modal-vh-80" onDismiss={this.resetModal} immediate >
                {b => [
                    b.selection.any() && <button type="button" key="counter" className="btn btn-link text-decoration-none mr-auto px-0"
                        onClick={b.selection.clear}>Clear selection</button>,
                    <Modal.Button key="close" text="Close" className="btn-secondary" dismiss />,
                    <Modal.Button key="add" className="btn-primary" icon="plus" disabled={b.selection.none()}
                        onClick={() => this.addItems(...b.getSelectionData()).then(b.selection.clear).then(this.reload)}>
                        Add{b.selection.any() && <span className="badge badge-light ml-1">{b.selection.length}</span>}
                    </Modal.Button>
                ]}
            </BrowserDialog>
        })
    }

    onRemoveItems = () => {
        const ids = [...this.selection.keys];
        const values = this.props.dataContext.source.result.filter(e => ids.includes(e.id));

        this.setState({
            modal: <Modal id="remove_items_confirm" title="Do you want to remove items from playlist?" className="modal-vh-80" onDismiss={this.resetModal} immediate >
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

        const { dataContext: data, navContext: { navigateHandler, page, pageSize, urls }, id, ...other } = this.props;
        const { source: { total = 0, result: { length: fetched = 0 } = {}, parents } = {} } = data || {};
        const disabled = this.selection.none();
        return <div className="d-flex flex-column h-100">
            {
                data ? <>
                    <Breadcrumb dataContext={parents} baseUrl={urls.root} />
                    <Toolbar className="position-sticky sticky-top px-2 py-1 bg-light shadow-sm">
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
                    <BrowserCore dataContext={data} filter={PlaylistManager.isEditable} navigateHandler={navigateHandler} selection={this.selection} {...other} />
                    <Pagination count={fetched} total={total} baseUrl={urls.current} current={page} size={pageSize} className="shadow-sm" />
                </> :
                    <LoadIndicator />
            }
            {this.state.modal && (typeof this.state.modal === "function" ? this.state.modal() : this.state.modal)}
        </div>;
    }
}

export const RoutedPlaylistManager = withBrowserCore(PlaylistManager, false,
    ({ device, id, navContext: { pageSize, page } }) => $api.browse(device).get(id)
        .withParents().withResource().withVendor().take(pageSize).skip((page - 1) * pageSize).url());