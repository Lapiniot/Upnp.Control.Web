import React from "react";
import { withRouter } from "react-router-dom";
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
                renderedKeys: data.result.map(i => i.id),
                selection: new SelectionService(),
                modal: null
            };
        }
        return null;
    }

    add = () => { alert("add"); };

    remove = () => {
        this.setState({
            modal: {
                id: "remove_confirm",
                title: "Do you want to delete?",
                immidiate: true,
                buttons: [
                    <Modal.Button key="delete" text="Delete" dismiss />,
                    <Modal.Button key="cancel" text="Cancel" dismiss />
                ],
                onDismiss: () => this.setState({ modal: null })
            }
        });
    };

    rename = () => { alert("rename"); };

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

    isSelected = id => { return this.state.selection.selected(id); }

    allSelected = () => { return this.state.selection.all(this.state.renderedKeys); };

    render() {
        const { navContext: { navigateHandler, page, pageSize, urls } } = this.props;

        const { result: items, parents, total } = this.state.data;

        const noSelection = !this.state.selection.any();

        return <div>
            <Toolbar className="position-sticky sticky-top px-3 py-2 bg-gray-200">
                <Toolbar.Group className="mr-2">
                    <Toolbar.Button title="Add" glyph="plus" onClick={this.add} />
                    <Toolbar.Button title="Remove" glyph="trash" onClick={this.remove} disabled={noSelection} />
                    <Toolbar.Button title="Rename" glyph="edit" onClick={this.rename} disabled={noSelection} />
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
            <Pagination count={items.length} total={total} baseUrl={urls.current} current={page} size={pageSize} />
            {this.state && this.state.modal ? <Modal {...this.state.modal} /> : null}
        </div>;
    }
}

export const RoutedPlaylistManager = withRouter(
    withNavigationContext(
        withDataFetch(PlaylistManager,
            { template: LoadIndicator },
            ({ device, id, navContext: { pageSize, page } }) =>
                `/api/browse/${device}/${id}?withParents=true&take=${pageSize}&skip=${(page - 1) * pageSize}`)));