import React from "react";
import AlbumArtImage from "./AlbumArtImage";
import SelectionService from "../../components/SelectionService";
import { DIDLUtils as utils } from "./BrowserCore";

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = { data: null, selectableKeys: [], selection: props.selection, modal: null };
    }

    static getDerivedStateFromProps({ dataContext, selection = new SelectionService(), filter = () => true }, state) {
        if (state.data !== dataContext) {
            return {
                data: dataContext,
                selectableKeys: dataContext.source.result.filter(filter).map(i => i.id),
                selection: selection,
                filter: filter
            }
        } else
            return null;
    }

    isSelected = id => this.state.selection.selected(id);

    allSelected = () => this.state.selection.all(this.state.selectableKeys);

    onSelect = (event) => {
        const checkbox = event.target;
        this.state.selection.select(checkbox.name, checkbox.checked);
        this.onSelectionChanged();
    };


    onSelectAll = (event) => {
        const checkbox = event.target;
        this.state.selection.selectMany(this.state.selectableKeys, checkbox.checked);
        this.onSelectionChanged();
    };

    onSelectionChanged = () => {
        const handler = this.props.onSelectionChanged;

        if (!handler || handler(this.state.selection, this.props.device, this.props.id) !== true) {
            // Perform default handling, if handler is not defined or returns any value other than "true" 
            // (means selection event is handled by external component itself)
            this.setState({ selection: this.state.selection });
        }
    }

    render() {
        const { navigateHandler } = this.props;
        const { result: items, parents } = this.state.data.source;
        return <div className="x-table x-table-sm x-table-hover-link x-table-striped x-table-head-light">
            <div>
                <div>
                    <div className="x-table-cell-min">
                        <input type="checkbox" id="select_all" onChange={this.onSelectAll}
                            checked={this.allSelected()} disabled={this.state.selectableKeys.length === 0} />
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
                    return <div key={`bws.${index}`} data-id={e.id} data-selected={selected} onDoubleClick={e.container ? navigateHandler : null}>
                        <div className="x-table-cell-min">
                            <input type="checkbox" name={e.id} onChange={this.onSelect} checked={selected} disabled={!this.state.filter(e)} />
                        </div>
                        <div>
                            <AlbumArtImage itemClass={e.class} albumArts={e.albumArts} />
                            {e.title}
                        </div>
                        <div className="text-capitalize">{utils.getKind(e.class)}</div>
                    </div>;
                })]}
            </div>
        </div>;
    }
}