import React from "react";
import { OnlineContentBrowserView } from "../ContentBrowser";
import ContentTableView from "../ContentTableView";
import DIDLItemRow, { DefaultCells } from "../DIDLItemRow";
import LevelUpRow from "../LevelUpRow";
import Pagination from "../Pagination";

class ContentTableHeader extends React.Component {
    render() {
        return (<React.Fragment>
            <div className="x-table-cell-min"><input type="checkbox" id="select_all" onChange={this.props.onSelect} /></div>
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
        const { "data-source": data, selected, onSelect, navcontext: { navigateHandler }, ...other } = this.props;
        return <DIDLItemRow id={data.id} data-selected={selected(data.id) ? true : null} onDoubleClick={navigateHandler} {...other}>
            <div className="x-table-cell-min">
                <input type="checkbox" name={data.id} onChange={onSelect} checked={selected(data.id) ? true : null} />
            </div>
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

class SelectionService {
    constructor() {
        this.map = new Map();
    }

    any = () => this.map.size > 0;

    select = (key, selected = true) => {
        if (selected)
            this.map.set(key, true);
        else
            this.map.delete(key);
    }

    selectMany = (keys, selected) => {
        keys.forEach(k => this.select(k, selected));
    }

    selected = (key) => this.map.has(key) && this.map.get(key);
}

export default class PlaylistManager extends React.Component {

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
    }

    add = () => { alert('add'); };
    remove = () => { alert('remove'); };
    rename = () => { alert('rename'); };
    copy = () => { alert('copy'); };

    onSelect = (event) => {
        const checkbox = event.target;
        this.selection.select(checkbox.name, checkbox.checked);
        this.setState({ selection: this.selection });
    };

    onSelectAll = (event) => {
        const checkbox = event.target;
        this.selection.selectMany(this.allKeys, checkbox.checked);
        this.setState({ selection: this.selection });
    };

    onDataReady = (data) => {
        this.allKeys = data.result.map(i => i.id);
        return data;
    };

    render() {
        return <OnlineContentBrowserView
            headerTemplate={Toolbar} headerProps={{ config: this.toolbarConfig }}
            containerTemplate={ContentBrowserTableView} containerProps={{ onSelect: this.onSelectAll }}
            itemTemplate={Item} itemProps={{ onSelect: this.onSelect, selected: this.selection.selected }}
            footerTemplate={Pagination} onDataReady={this.onDataReady}
            {...this.props} />;
    }
}