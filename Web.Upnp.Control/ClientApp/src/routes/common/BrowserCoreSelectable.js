import React from "react";
import AlbumArt from "./AlbumArt";
import SelectionService from "../../components/SelectionService";
import { DIDLUtils as utils } from "./BrowserUtils";

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = { modal: null };
        this.filter = props.filter;
        this.selection = props.selection || new SelectionService();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.filter !== this.props.filter) {
            this.filter = this.props.filter;
        }
        if (prevProps.selection !== this.props.selection) {
            this.selection = this.props.selection || new SelectionService();
        }
    }

    onSelect = event => {
        event.stopPropagation();
        const checkbox = event.target;
        const id = checkbox.parentElement.parentElement.dataset.id;
        const cancelled = !this.selection.select(id, checkbox.checked, { device: this.props.device, id: this.props.id });
        this.onSelectionChanged(cancelled);
    };

    onSelectAll = event => {
        const checkbox = event.target;
        const cancelled = !this.selection.selectMany(this.selectables, checkbox.checked, { device: this.props.device, id: this.props.id });
        this.onSelectionChanged(cancelled);
    };

    onClick = event => {
        event.stopPropagation();

        if (event.target.type === "checkbox") return;

        const row = event.currentTarget;
        const id = row.dataset.id;

        if (event.ctrlKey || event.metaKey) { // selective multi-selection
            const cancelled = !this.selection.select(id, !this.selection.selected(id), { device: this.props.device, id: this.props.id });
            this.onSelectionChanged(cancelled);
        }
        else if (event.shiftKey) { // range multi-selection
            const selectionStart = Math.max(this.selectables.indexOf(this.focusedItem), 0);
            const selectionEnd = this.selectables.indexOf(id);
            const range = this.selectables.slice(Math.min(selectionStart, selectionEnd), Math.max(selectionStart, selectionEnd) + 1);
            this.selection.reset();
            const cancelled = !this.selection.selectMany(range, true, { device: this.props.device, id: this.props.id });
            this.onSelectionChanged(cancelled);
        }
        else // single item selection
        {
            this.focusedItem = id;
            this.selection.reset();
            const cancelled = !this.selection.select(id, true, { device: this.props.device, id: this.props.id });
            this.onSelectionChanged(cancelled);
        }
    }

    clearFocus = () => {
        this.focusedItem = null;
        const cancelled = !this.selection.selectMany(this.selectables, false, { device: this.props.device, id: this.props.id });
        this.onSelectionChanged(cancelled);
    }

    onSelectionChanged = (cancelled) => {
        if (!cancelled) this.setState({ selection: true });
    }

    render() {
        const { navigate, filter = () => true, cellTemplate: MainCellTemplate = CellTemplate, cellContext } = this.props;
        const { source: { result: items = [], parents = [] } = {} } = this.props.dataContext || {};
        this.selectables = items.filter(filter).map(i => i.id);
        const allSelected = this.selection.all(this.selectables);
        return <div className="h-100" onClick={this.clearFocus}>
            <div className="x-table x-table-sm x-table-hover-link x-table-striped">
                <div className="position-sticky sticky-top bg-light">
                    <div>
                        <div className="x-table-cell-min">
                            <input type="checkbox" id="select_all" onChange={this.onSelectAll}
                                checked={allSelected} disabled={this.selectables.length === 0} />
                        </div>
                        <div>Name</div>
                        <div className="x-table-cell-min">Kind</div>
                    </div>
                </div>
                <div>
                    {parents && parents.length > 0 &&
                        <div data-id={parents[0].parentId} onDoubleClick={navigate}>
                            <div>&nbsp;</div>
                            <div>...</div>
                            <div>Parent</div>
                        </div>}
                    {[items.map((e, index) => {
                        const selected = this.selection.selected(e.id);
                        const active = typeof cellContext?.active === "function" && cellContext.active(e, index);
                        return <div key={`bws.${index}`} data-id={e.id} data-selected={selected} data-active={active} onClick={this.onClick} onDoubleClick={e.container ? navigate : null}>
                            <div className="x-table-cell-min">
                                <input type="checkbox" onChange={this.onSelect} checked={selected} disabled={!filter(e)} />
                            </div>
                            <MainCellTemplate data={e} index={index} context={cellContext} />
                            <div className="text-capitalize" title={JSON.stringify(e, null, 2)}>{utils.getDisplayName(e.class)}</div>
                        </div>;
                    })]}
                </div>
            </div>
        </div>;
    }
}

const CellTemplate = ({ data: { class: itemClass, albumArts, title, creator, album } }) =>
    <div className="d-flex align-items-center">
        <AlbumArt itemClass={itemClass} albumArts={albumArts} className="mr-2" />
        <div>
            {title}
            {creator && <small>&nbsp;&bull;&nbsp;{creator}</small>}
            {album && <small>&nbsp;&bull;&nbsp;{album}</small>}
        </div>
    </div>;