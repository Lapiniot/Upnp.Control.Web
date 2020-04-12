import React from "react";
import AlbumArt from "./AlbumArt";
import SelectionService from "../../components/SelectionService";
import { DIDLUtils as utils } from "./BrowserCore";

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

    isSelected = id => this.selection.selected(id);

    onSelect = (event) => {
        const checkbox = event.target;
        const cancelled = !this.selection.select(checkbox.name, checkbox.checked, { device: this.props.device, id: this.props.id });
        this.onSelectionChanged(cancelled);
    };

    onSelectAll = (event) => {
        const checkbox = event.target;
        const cancelled = !this.selection.selectMany(this.selectables, checkbox.checked, { device: this.props.device, id: this.props.id });
        this.onSelectionChanged(cancelled);
    };

    onSelectionChanged = (cancelled) => {
        if (!cancelled) this.setState({ selection: true });
    }

    render() {
        const { navigateHandler, filter = () => true,
            dataContext: { source: { result: items = [], parents = [] } = {} } = {},
            cellTemplate: MainCellTemplate = CellTemplate, cellContext } = this.props;
        this.selectables = items.filter(filter).map(i => i.id);
        const allSelected = this.selection.all(this.selectables);
        return <div className="x-table x-table-sm x-table-hover-link x-table-striped x-table-head-light">
            <div className="position-sticky sticky-top">
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
                    <div data-id={parents[0].parentId} onDoubleClick={navigateHandler}>
                        <div>&nbsp;</div>
                        <div>...</div>
                        <div>Parent</div>
                    </div>}
                {[items.map((e, index) => {
                    const selected = this.isSelected(e.id);
                    return <div key={`bws.${index}`} data-id={e.id} data-selected={selected} onDoubleClick={e.container ? navigateHandler : null}>
                        <div className="x-table-cell-min">
                            <input type="checkbox" name={e.id} onChange={this.onSelect} checked={selected} disabled={!filter(e)} />
                        </div>
                        <MainCellTemplate data={e} context={cellContext} />
                        <div className="text-capitalize" title={JSON.stringify(e, null, 2)}>{utils.getDisplayName(e.class)}</div>
                    </div>;
                })]}
            </div>
        </div>;
    }
}

const CellTemplate = ({ data: { class: itemClass, albumArts, title } }) =>
    <div><AlbumArt itemClass={itemClass} albumArts={albumArts} className="mr-2" />{title}</div>;