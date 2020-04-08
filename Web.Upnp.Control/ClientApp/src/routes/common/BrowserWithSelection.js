import React from "react";
import AlbumArt from "./AlbumArt";
import SelectionService from "../../components/SelectionService";
import { DIDLUtils as utils } from "./BrowserCore";

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = { data: null, selectableKeys: [], selection: props.selection, modal: null };
    }

    static getDerivedStateFromProps({ dataContext, selection, filter = () => true }, state) {
        return (state.data !== dataContext) ? {
            data: dataContext,
            selectableKeys: dataContext.source.result.filter(filter).map(i => i.id),
            selection: selection || new SelectionService(),
            filter: filter
        } : null;
    }

    isSelected = id => this.state.selection.selected(id);

    allSelected = () => this.state.selection.all(this.state.selectableKeys);

    onSelect = (event) => {
        const checkbox = event.target;
        const cancelled = !this.state.selection.select(checkbox.name, checkbox.checked, { device: this.props.device, id: this.props.id });
        this.onSelectionChanged(cancelled);
    };

    onSelectAll = (event) => {
        const checkbox = event.target;
        const cancelled = !this.state.selection.selectMany(this.state.selectableKeys, checkbox.checked, { device: this.props.device, id: this.props.id });
        this.onSelectionChanged(cancelled);
    };

    onSelectionChanged = (cancelled) => {
        if (!cancelled) this.setState({ selection: this.state.selection })
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
                            <div className="d-inline-block stack mr-1">
                                <AlbumArt itemClass={e.class} albumArts={e.albumArts} />
                                <div className="stack-layer stack-layer-hover d-flex">
                                    <i className="m-auto fas fa-lg fa-play-circle" />
                                </div>
                            </div>
                            {e.title}
                        </div>
                        <div className="text-capitalize">{utils.getDisplayName(e.class)}</div>
                    </div>;
                })]}
            </div>
        </div>;
    }
}