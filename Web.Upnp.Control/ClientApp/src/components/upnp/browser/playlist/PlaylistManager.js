import React from "react";
import { OnlineContentBrowserView } from "../ContentBrowser";
import ContentTableView from "../ContentTableView";
import DIDLItemRow, { DefaultCells } from "../DIDLItemRow";
import LevelUpRow from "../LevelUpRow";
import Pagination from "../Pagination";

class ContentTableHeader extends React.Component {
    render() {
        return (<React.Fragment>
            <div className="x-table-cell-min"><input type="checkbox" id="select_all" /></div>
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
        </LevelUpRow>
    }
}

class Item extends React.Component {
    render() {
        return <DIDLItemRow {...this.props}>
            <div className="x-table-cell-min"><input type="checkbox" name={this.props["data-source"].id} onChange={this.props.handler} /></div>
            <DefaultCells {...this.props} />
        </DIDLItemRow>;
    }
}

class ContentBrowserTableView extends React.Component {
    render() {
        return <ContentTableView headerTemplate={ContentTableHeader} injectStart={LevelUp} {...this.props} />
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

    constructor(props) {
        super(props);
        this.selection = new Map();
    }

    add = () => { alert('add'); };
    remove = () => { alert('remove'); };
    rename = () => { alert('rename'); };
    copy = () => { alert('copy'); };
    
    onSelect = (event) => {
        const checkbox = event.target;
        if (checkbox.checked)
            this.selection.set(checkbox.name, true);
        else
            this.selection.delete(checkbox.name);
        this.forceUpdate();
    };

    someItemSelected = () => this.selection.size != 0;

    config = [
        { caption: "Add", glyph: "plus", handler: this.add, isEnabled: () => { return true; } },
        { caption: "Remove", glyph: "trash", handler: this.remove, isEnabled: this.someItemSelected },
        { caption: "Rename", glyph: "edit", handler: this.rename, isEnabled: this.someItemSelected },
        { caption: "Copy", glyph: "copy", handler: this.copy, isEnabled: this.someItemSelected }
    ];

    render() {
        return <OnlineContentBrowserView
            headerTemplate={Toolbar} headerProps={{ config: this.config }}
            containerTemplate={ContentBrowserTableView}
            itemTemplate={Item} itemProps={{ handler: this.onSelect }}
            footerTemplate={Pagination}
            {...this.props} />;
    }
}