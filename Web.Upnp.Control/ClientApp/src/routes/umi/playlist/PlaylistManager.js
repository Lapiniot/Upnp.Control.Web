import React from "react";
import { withRouter } from "react-router-dom";
import Modal from "../../../components/Modal";
import SelectionService from "../../../components/SelectionService";
import { OnlineContentBrowserView } from "../../common/ContentBrowser";
import ContentTableView from "../../common/ContentTableView";
import DIDLItemRow, { DefaultCells } from "../../common/DIDLItemRow";
import LevelUpRow from "../../common/LevelUpRow";
import Pagination from "../../common/Pagination";

class ContentTableHeader extends React.Component {
    render() {
        return (<React.Fragment>
                    <div className="x-table-cell-min">
                        <input type="checkbox" id="select_all" checked={this.props.getState()} onChange={this.props.onChange} />
                    </div>
                    <div>Name</div>
                    <div className="x-table-cell-min">Kind</div>
                </React.Fragment>);
    }
}

class LevelUp extends React.Component {
    render() {
        return <LevelUpRow {...this.props}>
                   <div>&nbsp;</div>
                   <div>...</div>
                   <div>Parent</div>
               </LevelUpRow>;
    }
}

class Item extends React.Component {
    render() {
        const { "data-source": data, getState, onChange, navcontext: { navigateHandler }, ...other } = this.props;
        return <DIDLItemRow id={data.id} data-selected={getState(data.id) ? true : null} onDoubleClick={navigateHandler} {...other}>
                   <div className="x-table-cell-min">
                       <input type="checkbox" name={data.id} onChange={onChange} checked={getState(data.id)} />
                   </div>
                   <DefaultCells {...this.props} />
               </DIDLItemRow>;
    }
}

class ContentBrowserTableView extends React.Component {
    render() {
        return <ContentTableView headerTemplate={ContentTableHeader} injectStart={LevelUp} {...this.props} />;
    }
}

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
        this.allKeys = [];
        this.data = null;
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
        console.log(checkbox);
        this.selection.select(checkbox.name, checkbox.checked);
        this.setState({ selection: this.selection });
    };

    onSelectAll = (event) => {
        const checkbox = event.target;
        this.selection.selectMany(this.allKeys, checkbox.checked);
        this.setState({ selection: this.selection });
    };

    isSelected = id => { return this.selection.selected(id); }

    allSelected = () => { return this.selection.all(this.allKeys); };

    onDataReady = (data) => {
        this.selection.clear();
        this.allKeys = data.result.map(i => i.id);
        this.data = data.result;
        return data;
    };

    render() {
        return <React.Fragment>
                   <OnlineContentBrowserView
                       headerTemplate={Toolbar} headerProps={{ config: this.toolbarConfig }}
                       containerTemplate={ContentBrowserTableView} containerProps={{ onChange: this.onSelectAll, getState: this.allSelected }}
                       itemTemplate={Item} itemProps={{ onChange: this.onSelect, getState: this.isSelected }}
                       footerTemplate={Pagination} onDataReady={this.onDataReady}
                       {...this.props} />
                   {this.state && this.state.modalState ? <Modal {...this.state.modalState} /> : null}
               </React.Fragment>;
    }
}

export const RoutedPLaylistManager = withRouter(PlaylistManager);
