import React from "react";
import { withRouter } from "react-router-dom";
import $api from "../../../components/WebApi";
import { withDataFetch } from "../../../components/Extensions";
import { withNavigationContext } from "../../common/Navigator";
import Modal from "../../../components/Modal";
import { TextValueEditDialog, ConfirmationDialog } from "../../../components/Dialogs";
import BrowserDialog from "../../common/BrowserDialog";
import Toolbar from "../../../components/Toolbar";
import Pagination from "../../common/Pagination";
import LoadIndicator from "../../../components/LoadIndicator";
import BrowserCore from "../../common/BrowserWithSelection";

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
        return item.vendor["mi:playlistType"] !== "aux";
    }

    resetModalState = () => {
        this.setState({ modal: null });
    }

    wrap = (requestInvoker) => {
        return async (...args) => {
            try {
                const response = await requestInvoker(...args);
                const json = await response.json();
                console.info(json);
            } catch (e) {
                console.error(e);
            } finally {
                this.props.dataContext.reload();
            }
        };
    }

    create = () => {

        let title = "New Playlist";

        const onChanged = event => { title = event.target.value; };

        const createAction = this.wrap(() => $api.playlist(this.props.device).create(title).fetch());

        this.setState({
            modal: () => {
                return <TextValueEditDialog id="create_confirm" title="Create new playlist" label="Name" confirmText="Create"
                                            defaultValue={title} onValueChanged={onChanged} onConfirm={createAction}
                                            immediate onDismiss={this.resetModalState} />;
            }
        });
    };

    remove = () => {

        const ids = [...this.state.selection.keys];
        const values = this.state.data.source.result.filter(e => ids.includes(e.id));
        const removeAction = this.wrap(() => $api.playlist(this.props.device).delete(ids).fetch());

        this.setState({
            modal: () => {
                return <ConfirmationDialog id="remove_confirm" title="Do you want to delete?" confirmText="Delete" immediate
                                           onConfirm={removeAction} onDismiss={this.resetModalState}>
                           <ul className="list-unstyled">
                               {[values.map((e, i) => <li key={i}>{e.title}</li>)]}
                           </ul>
                       </ConfirmationDialog>;
            }
        });
    };

    rename = () => {
        const id = this.state.selection.keys.next().value;
        let title = this.state.data.source.result.find(e => e.id === id).title;

        const onChanged = event => { title = event.target.value; };
        const renameAction = this.wrap(() => $api.playlist(this.props.device).rename(id, title).fetch());

        this.setState({
            modal: () => {
                return <TextValueEditDialog id="rename_confirm" title="Rename playlist" label="Name" confirmText="Rename"
                                            defaultValue={title} onValueChanged={onChanged} onConfirm={renameAction}
                                            immediate onDismiss={this.resetModalState} />;
            }
        });
    };

    add = () => {
        const addAction = this.wrap(
            args => $api
            .playlist(this.props.device)
            .add(this.props.id, args.device, args.selection)
            .fetch());

        this.setState({
            modal: () => {
                return <BrowserDialog id="browse_dialog" title="Select items to add"
                                      confirmText="Add" className="modal-lg" immediate
                                      onConfirm={addAction} onDismiss={this.resetModalState} />;
            }
        });
    };

    copy = () => { alert("copy"); };

    onSelectionChanged = (selection) => {
        this.setState({ selection: selection });
        return true;
    }

    render() {
        const { id, navContext: { navigateHandler, page, pageSize, urls } } = this.props;
        const { source: { total, result: { length: fetched } } } = this.state.data;

        const selection = this.state.selection;

        const noSelection = !selection || !selection.any();

        return <div>
                   <Toolbar className="position-sticky sticky-top px-3 py-2 bg-light">
                       {id === "PL:"
                           ? <Toolbar.Group>
                                 <Toolbar.Button title="Create" glyph="plus" onClick={this.create} />
                                 <Toolbar.Button title="Delete" glyph="trash" onClick={this.remove} disabled={noSelection} />
                                 <Toolbar.Button title="Rename" glyph="edit" onClick={this.rename} disabled={!selection || !selection.one()} />
                                 <Toolbar.Button title="Copy" glyph="copy" onClick={this.copy} disabled={noSelection} />
                             </Toolbar.Group>
                           : <Toolbar.Group>
                                 <Toolbar.Button title="Add items" glyph="plus" onClick={this.add} />
                                 <Toolbar.Button title="Remove items" glyph="trash" disabled={noSelection} />
                             </Toolbar.Group>}
                   </Toolbar>
                   <BrowserCore dataContext={this.state.data} filter={PlaylistManager.isEditable} navigateHandler={navigateHandler} onSelectionChanged={this.onSelectionChanged} />
                   <Pagination count={fetched} total={total} baseUrl={urls.current} current={page} size={pageSize} />
                   {this.state && this.state.modal ? (typeof this.state.modal === "function" ? this.state.modal() : <Modal {...this.state.modal} />) : null}
               </div>;
    }
}

export const RoutedPlaylistManager = withRouter(
    withNavigationContext(
        withDataFetch(PlaylistManager,
            { template: LoadIndicator },
            ({ device, id, navContext: { pageSize, page } }) =>
            $api.browse(device).get(id).withParents().take(pageSize).skip((page - 1) * pageSize).url())));