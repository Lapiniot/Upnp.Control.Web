import React from "react";
import AlbumArt from "./AlbumArt";
import SelectionService from "../../components/SelectionService";
import { DIDLUtils as utils } from "./BrowserUtils";

export default class MediaBrowser extends React.Component {
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

    componentDidMount() {
        document.addEventListener("keydown", this.onKeyDown);
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.onKeyDown)
    }

    onCheckboxChanged = e => {
        e.stopPropagation();
        const checkbox = e.target;
        const id = checkbox.parentElement.parentElement.dataset.id;
        const cancelled = !this.selection.select(id, checkbox.checked, { device: this.props.device, id: this.props.id });
        this.notifySelectionChanged(cancelled);
    };

    onCheckboxAllChanged = e => {
        const checkbox = e.target;
        const cancelled = !this.selection.selectMany(this.selectables, checkbox.checked, { device: this.props.device, id: this.props.id });
        this.notifySelectionChanged(cancelled);
    };

    onRowMouseDown = e => {
        e.stopPropagation();

        if (e.target.type === "checkbox") return;

        const row = e.currentTarget;
        const id = row.dataset.id;

        if (e.ctrlKey || e.metaKey) {
            // selective multi-selection
            this.toggleSelection(id);
        }
        else if (e.shiftKey) {
            e.preventDefault();
            // range multi-selection
            const selectionStart = Math.max(this.selectables.indexOf(this.focusedItem), 0);
            const selectionEnd = this.selectables.indexOf(id);
            this.selectRange(selectionStart, selectionEnd);
        }
        else // single item selection
        {
            this.focusedItem = id;
            this.selection.reset();
            const cancelled = !this.selection.select(id, true, { device: this.props.device, id: this.props.id });
            this.notifySelectionChanged(cancelled);
        }
    }

    onContainerMouseDown = e => {
        if (e.target === e.currentTarget) {
            this.toggleSelectionAll(false);
        }
    }

    onKeyDown = e => {
        if (!e.cancelBubble && (e.metaKey || e.ctrlKey) && e.code === "KeyA") {
            e.preventDefault();
            e.stopPropagation();
            this.toggleSelectionAll(true);
        }
    }

    notifySelectionChanged = (cancelled) => {
        if (!cancelled) this.setState({ selection: true });
    }

    selectRange(selectionStart, selectionEnd) {
        const range = this.selectables.slice(Math.min(selectionStart, selectionEnd), Math.max(selectionStart, selectionEnd) + 1);
        this.selection.reset();
        const cancelled = !this.selection.selectMany(range, true, { device: this.props.device, id: this.props.id });
        this.notifySelectionChanged(cancelled);
    }

    toggleSelection(id) {
        const cancelled = !this.selection.select(id, !this.selection.selected(id), { device: this.props.device, id: this.props.id });
        this.notifySelectionChanged(cancelled);
    }

    toggleSelectionAll(state) {
        this.focusedItem = null;
        const details = { device: this.props.device, id: this.props.id };
        const cancelled = state ?
            !this.selection.selectMany(this.selectables, state, details) :
            !this.selection.clear(details);
        this.notifySelectionChanged(cancelled);
    }

    static Header({ children, className }) {
        return <div className={`table-caption${className ? ` ${className}` : ""}`}>{children}</div>;
    }

    static Footer({ children }) {
        return <div>{children}</div>;
    }

    render() {
        const { className, navigate, filter = () => true, cellTemplate: MainCellTemplate = CellTemplate, cellContext,
            useCheckboxes = true, selectOnClick = true } = this.props;
        const { source: { result: items = [], parents = [] } = {} } = this.props.dataContext || {};
        this.selectables = items.filter(filter).map(i => i.id);
        const children = React.Children.toArray(this.props.children);
        const header = children.find(c => c.type === MediaBrowser.Header);
        const footer = children.find(c => c.type === MediaBrowser.Footer);
        return <div className={`auto-table table-compact table-hover-link table-striped${className ? ` ${className}` : ""}`}
            onMouseDown={selectOnClick && this.onContainerMouseDown}>
            {header}
            <div>
                <div>
                    {useCheckboxes &&
                        <div className="cell-min">
                            <input type="checkbox" id="select_all" onChange={this.onCheckboxAllChanged}
                                checked={this.selection.all(this.selectables)} disabled={this.selectables.length === 0} />
                        </div>}
                    <div>Name</div>
                    <div className="cell-min">Size</div>
                    <div className="cell-min">Time</div>
                    <div className="cell-min">Kind</div>
                </div>
            </div>
            <div>
                {parents && parents.length > 0 &&
                    <div data-id={parents[0].parentId} onDoubleClick={navigate}>
                        {useCheckboxes && <div>&nbsp;</div>}
                        <div>...</div>
                        <div>&nbsp;</div>
                        <div>&nbsp;</div>
                        <div>Parent</div>
                    </div>}
                {[items.map((e, index) => {
                    const selected = this.selection.selected(e.id);
                    const active = typeof cellContext?.active === "function" && cellContext.active(e, index);
                    const canBeSelected = selectOnClick && filter(e);
                    return <div key={`bws.${index}`} data-id={e.id} data-selected={selected} data-active={active} onMouseDown={canBeSelected && this.onRowMouseDown} onDoubleClick={e.container ? navigate : null}>
                        {useCheckboxes && <div>
                            <input type="checkbox" onChange={this.onCheckboxChanged} checked={selected} disabled={!filter(e)} />
                        </div>}
                        <MainCellTemplate data={e} index={index} context={cellContext} />
                        <div className="small text-nowrap text-right">{utils.formatSize(e.res.size)}</div>
                        <div className="small">{utils.formatTime(e.res.duration)}</div>
                        <div className="text-capitalize" title={JSON.stringify(e, null, 2)}>{utils.getDisplayName(e.class)}</div>
                    </div>;
                })]}
            </div>
            {footer}
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