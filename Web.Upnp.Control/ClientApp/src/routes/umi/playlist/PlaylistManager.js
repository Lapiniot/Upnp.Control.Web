import React from "react";
import { withRouter } from "react-router-dom";
import { withDataFetch } from "../../../components/Extensions";
import { withNavigationContext } from "../../common/Navigator";
import { DIDLUtils } from "../../common/Browser";
import Modal from "../../../components/Modal";
import SelectionService from "../../../components/SelectionService";
import Pagination from "../../common/Pagination";
import LoadIndicator from "../../../components/LoadIndicator";
import AlbumArtImage from "../../common/AlbumArtImage";


class Toolbar extends React.Component {
    render() {
        return <div className="btn-toolbar position-sticky sticky-top px-3 py-2 bg-gray-200" role="toolbar" aria-label="Playlist editor toolbar">
                   <div className="btn-group mr-2" role="group" aria-label="Playlist editor buttons">
                       {[this.props.config.map((e, i) =>
                           <button key={i} type="button" className="btn btn-light" onClick={e.handler} disabled={e.isEnabled() ? null : true}>
                               <i className={`fas fa-${e.glyph}`} />
                           </button>)]}
                   </div>
               </div>;
    }
}


export default class PlaylistManager extends React.Component {

    displayName = PlaylistManager.name;

    constructor(props) {
        super(props);
        this.selection = new SelectionService();
        this.toolbarConfig = [
            { caption: "Add", glyph: "plus", handler: this.add, isEnabled: () => true },
            { caption: "Remove", glyph: "trash", handler: this.remove, isEnabled: this.selection.any },
            { caption: "Rename", glyph: "edit", handler: this.rename, isEnabled: this.selection.any },
            { caption: "Copy", glyph: "copy", handler: this.copy, isEnabled: this.selection.any }
        ];
        this.renderedKeys = [];
    }

    add = () => { alert("add"); };

    remove = () => {
        this.setState({
            modalState: {
                id: "remove_confirm",
                title: "Do you want to delete?",
                immidiate: true,
                buttons: [
                    <Modal.Button key="delete" text="Delete" dismiss />,
                    <Modal.Button key="cancel" text="Cancel" dismiss />
                ]
            }
        });
    };

    rename = () => { alert("rename"); };

    copy = () => { alert("copy"); };

    onSelect = (event) => {
        const checkbox = event.target;
        this.selection.select(checkbox.name, checkbox.checked);
        this.setState({ selection: this.selection });
    };

    onSelectAll = (event) => {
        const checkbox = event.target;
        this.selection.selectMany(this.renderedKeys, checkbox.checked);
        this.setState({ selection: this.selection });
    };

    isSelected = id => { return this.selection.selected(id); }

    allSelected = () => { return this.selection.all(this.renderedKeys); };

    render() {
        const { dataContext: data = {}, navContext: { navigateHandler, page, pageSize, urls } } = this.props;

        this.renderedKeys = data.result.map(i => i.id);

        return <div>
                   <Toolbar config={this.toolbarConfig} />
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
                           <div data-id={data.parents[0].parentId} onDoubleClick={navigateHandler}>
                               <div>&nbsp;</div>
                               <div>...</div>
                               <div>Parent</div>
                           </div>
                           {[data.result.map((e, index) => {
                               const selected = this.isSelected(e.id);
                               return <div key={index} data-id={e.id} data-selected={selected} onDoubleClick={navigateHandler}>
                                          <div className="x-table-cell-min">
                                              <input type="checkbox" name={e.id} onChange={this.onSelect} checked={selected} />
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
                   <Pagination count={data.result.length} total={data.total} baseUrl={urls.current} current={page} size={pageSize} />
                   {this.state && this.state.modalState ? <Modal {...this.state.modalState} /> : null}
               </div>;
    }
}

export const RoutedPlaylistManager = withRouter(
    withNavigationContext(
        withDataFetch(PlaylistManager,
            { template: LoadIndicator },
            ({ device, id, navContext: { pageSize, page } }) => {
                return `/api/browse/${device}/${id}?withParents=true&take=${pageSize}&skip=${(page - 1) * pageSize}`;
            })));