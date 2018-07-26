import React from "react";
import AlbumArtImage from "./AlbumArtImage";
import SelectionService from "../../components/SelectionService";
import { DIDLUtils } from "./Browser";

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = { data: null, selectableKeys: [], selection: null, modal: null };
    }

    static getDerivedStateFromProps(props, state) {
        if (state.data !== props.dataContext) {
            const data = props.dataContext;
            const filter = props.filter || (() => true);
            return {
                data: data,
                selectableKeys: data.source.result.filter(filter).map(i => i.id),
                selection: new SelectionService(),
                filter: filter
            };
        }
        return null;
    }

    isSelected = id => { return this.state.selection.selected(id); };

    allSelected = () => { return this.state.selection.all(this.state.selectableKeys); };

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

        if (!handler || handler(this.state.selection, this.state.selectableKeys) !== true) {
            // Perform default handling, if handler is not defined or returns any value other than "true" 
            // (means selection event is handled by external component itself)
            this.setState({ selection: this.state.selection });
        }
    }

    render() {
        const { navigateHandler, ...other } = this.props;
        const { result: items, parents } = this.state.data.source;
        return <div className="x-table x-table-sm x-table-hover-link x-table-striped x-table-head-light" {...other}>
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
                                          <input type="checkbox" name={e.id} onChange={this.onSelect} checked={selected} disabled={!this.state.filter(e)} />
                                      </div>
                                      <div>
                                          <AlbumArtImage itemClass={e.class} albumArts={e.albumArts} />
                                          {e.title}
                                      </div>
                                      <div className="text-capitalize">{DIDLUtils.getKind(e.class)}</div>
                                  </div>;
                       })]}
                   </div>
               </div>;

    }
}