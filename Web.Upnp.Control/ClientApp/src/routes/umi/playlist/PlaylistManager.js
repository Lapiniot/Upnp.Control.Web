import React from "react";
import { withRouter } from "react-router-dom";
import $api from "../../../components/WebApi";
import { withDataFetch } from "../../../components/Extensions";
import { withNavigationContext } from "../../common/Navigator";
import { DIDLUtils } from "../../common/Browser";
import Modal from "../../../components/Modal";
import SelectionService from "../../../components/SelectionService";
import Toolbar from "../../../components/Toolbar";
import Pagination from "../../common/Pagination";
import LoadIndicator from "../../../components/LoadIndicator";
import AlbumArtImage from "../../common/AlbumArtImage";

export default class PlaylistManager extends React.Component {

    displayName = PlaylistManager.name;

    constructor(props) {
        super(props);
        this.state = { data: null, renderedKeys: [], selection: null, modal: null };
    }

    static getDerivedStateFromProps(props, state) {
        if (state.data !== props.dataContext) {
            const data = props.dataContext;
            return {
                data: data,
                renderedKeys: data.source.result.filter(item => !PlaylistManager.isReadOnly(item)).map(i => i.id),
                selection: new SelectionService(),
                modal: null
            };
        }
        return null;
    }

    static isReadOnly(item) {
        return item.vendor["mi:playlistType"] === "aux";
    }

    resetModalState = () => {
        this.setState({ modal: null });
    }

    create = () => {

        let title = "New Playlist";

        const onChange = event => { title = event.target.value; };

        const createAsync = async () => {
            try {
                const response = await $api.playlist(this.props.device).create(title).fetch();
                const json = await response.json();
                console.info(json);
            } catch (e) {
                console.error(e);
            } finally {
                this.props.dataContext.reload();
            }
        };

        this.setState({
            modal: () => {
                return <Modal id="add_confirm" title="Create new playlist" immediate onDismiss={this.resetModalState}>
                           <div className="input-group mb-3">
                               <div className="input-group-prepend">
                                   <span className="input-group-text" id="basic-addon1">Name</span>
                               </div>
                               <input type="text" onChange={onChange} className="form-control" defaultValue={title} placeholder="[enter new name]" aria-label="Name" aria-describedby="basic-addon1" />
                           </div>
                           <Modal.Footer>
                               <Modal.Button key="create" text="Create" className="btn-primary" onClick={createAsync} dismiss />
                               <Modal.Button key="cancel" text="Cancel" className="btn-secondary" dismiss />
                           </Modal.Footer>
                       </Modal>;
            }
        });
    };

    remove = () => {

        const ids = [...this.state.selection.selection];
        const values = this.state.data.source.result.filter(e => ids.includes(e.id));
        const removeImpl = async () => {
            try {
                const response = await $api.playlist(this.props.device).delete(ids).fetch();
                const json = await response.json();
                console.info(json);
            } catch (e) {
                console.error(e);
            } finally {
                this.props.dataContext.reload();
            }
        };

        this.setState({
            modal: () => {
                return <Modal id="remove_confirm" title="Do you want to delete?" immediate onDismiss={this.resetModalState}>
                           <ul className="list-unstyled">
                               {[values.map((e, i) => <li key={i}>{e.title}</li>)]}
                           </ul>
                           <Modal.Footer>
                               <Modal.Button key="delete" text="Delete" className="btn-primary" onClick={removeImpl} dismiss />
                               <Modal.Button key="cancel" text="Cancel" className="btn-secondary" dismiss />
                           </Modal.Footer>
                       </Modal>;
            }
        });
    };

    rename = () => {
        const id = this.state.selection.selection.next().value;
        let title = this.state.data.source.result.find(e => e.id === id).title;

        const onChange = event => { title = event.target.value; };

        const renameAsync = async () => {
            try {
                const response = await $api.playlist(this.props.device).rename(id, title).fetch();
                const json = await response.json();
                console.info(json);
            } catch (e) {
                console.error(e);
            } finally {
                this.props.dataContext.reload();
            }
        };

        this.setState({
            modal: () => {
                return <Modal id="rename_confirm" title="Rename playlist" immediate onDismiss={this.resetModalState}>
                           <div className="input-group mb-3">
                               <div className="input-group-prepend">
                                   <span className="input-group-text" id="basic-addon1">Name</span>
                               </div>
                               <input type="text" onChange={onChange} defaultValue={title} className="form-control" placeholder="[enter new name]" aria-label="Name" aria-describedby="basic-addon1" />
                           </div>
                           <Modal.Footer>
                               <Modal.Button key="rename" text="Rename" className="btn-primary" onClick={renameAsync} dismiss />
                               <Modal.Button key="cancel" text="Cancel" className="btn-secondary" dismiss />
                           </Modal.Footer>
                       </Modal>;
            }
        });
    };

    copy = () => { alert("copy"); };

    onSelect = (event) => {
        const checkbox = event.target;
        this.state.selection.select(checkbox.name, checkbox.checked);
        this.setState({ selection: this.state.selection });
    };

    onSelectAll = (event) => {
        const checkbox = event.target;
        this.state.selection.selectMany(this.state.renderedKeys, checkbox.checked);
        this.setState({ selection: this.state.selection });
    };

    isSelected = id => { return this.state.selection.selected(id); };

    allSelected = () => { return this.state.selection.all(this.state.renderedKeys); };

    render() {
        const { navContext: { navigateHandler, page, pageSize, urls } } = this.props;

        const { result: items, parents, total } = this.state.data.source;

        const noSelection = !this.state.selection.any();

        return <div>
                   <Toolbar className="position-sticky sticky-top px-3 py-2 bg-light">
                       <Toolbar.Group>
                           <Toolbar.Button title="Add" glyph="plus" onClick={this.create} />
                           <Toolbar.Button title="Remove" glyph="trash" onClick={this.remove} disabled={noSelection} />
                           <Toolbar.Button title="Rename" glyph="edit" onClick={this.rename} disabled={!this.state.selection.one()} />
                           <Toolbar.Button title="Copy" glyph="copy" onClick={this.copy} disabled={noSelection} />
                       </Toolbar.Group>
                   </Toolbar>
                   <div className="x-table x-table-sm x-table-hover-link x-table-striped x-table-head-light">
                       <div>
                           <div>
                               <div className="x-table-cell-min">
                                   <input type="checkbox" id="select_all" checked={this.allSelected()} onChange={this.onSelectAll} />
                               </div>
                               <div>Name</div>
                               <div className="x-table-cell-min">Kind</div>
                           </div>
                       </div>
                       <div>
                           <div data-id={parents[0].parentId} onDoubleClick={navigateHandler}>
                               <div>&nbsp;</div>
                               <div>...</div>
                               <div>Parent</div>
                           </div>
                           {[items.map((e, index) => {
                               const selected = this.isSelected(e.id);
                               return <div key={index} data-id={e.id} data-selected={selected} onDoubleClick={navigateHandler}>
                                          <div className="x-table-cell-min">
                                              <input type="checkbox" name={e.id} onChange={this.onSelect} checked={selected} disabled={PlaylistManager.isReadOnly(e)} />
                                          </div>
                                          <div>
                                              <AlbumArtImage itemClass={e.class} albumArts={e.albumArts} />
                                              {e.title}
                                          </div>
                                          <div className="text-capitalize">{DIDLUtils.getKind(e.class)}</div>
                                      </div>;
                           })]}
                       </div>
                   </div>
                   <Pagination count={items.length} total={total} baseUrl={urls.current} current={page} size={pageSize} />
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