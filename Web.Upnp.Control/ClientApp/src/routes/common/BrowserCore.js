import React from "react";
//import Tooltip from "bootstrap/js/dist/tooltip";
import AlbumArt from "./AlbumArt";
import SelectionService from "../../components/SelectionService";
import { DIDLUtils as utils } from "./BrowserUtils";

export default class MediaBrowser extends React.Component {
    constructor(props) {
        super(props);
        this.state = { modal: null };
        this.filter = props.filter;
        this.selection = props.selection || new SelectionService();
        this.tableRef = React.createRef();
        this.resizeObserver = new ResizeObserver(this.onCaptionResized);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.filter !== this.props.filter) {
            this.filter = this.props.filter;
        }
        if (prevProps.selection !== this.props.selection) {
            this.selection = this.props.selection || new SelectionService();
        }

        /*const options = {
            delay: 1000, html: true, placement: "bottom",
            template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner text-left" style="hyphens: auto"></div></div>'
        };
        this.tableRef.current.querySelectorAll("[data-toggle='tooltip']").forEach(e => new Tooltip(e, options));*/
    }

    componentDidMount() {
        document.addEventListener("keydown", this.onKeyDown, this.props.captureKeyboardEvents === true);

        const scope = this.tableRef.current;
        const caption = scope.querySelector("div.table-caption:first-of-type");

        if (caption) {
            this.resizeObserver.disconnect();
            this.resizeObserver.observe(caption);
        }
        else {
            const headers = scope.querySelectorAll(`div:nth-of-type(${caption ? 2 : 1}) > div > div`);
            this.adjustStickyElements(caption, headers);
        }
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.onKeyDown);
        this.resizeObserver.disconnect();
    }

    onCaptionResized = entries => {
        const caption = entries[0].target;
        const headers = caption.nextSibling.firstChild.childNodes;
        this.adjustStickyElements(caption, headers);
    }

    adjustStickyElements(caption, headers) {
        if (caption) {
            const rect = caption.getBoundingClientRect();
            const top = Math.min(rect.top, caption.offsetTop);
            const captionBottom = `${top + rect.height}px`;
            caption.style.top = `${top}px`;
            if (headers) headers.forEach(header => { header.style.top = captionBottom; });
        }
        else if (headers) {
            headers.forEach(h => { h.style.top = `${Math.min(h.getBoundingClientRect().top, h.offsetTop)}px`; });
        }
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

    static Header({ children, className, sticky = true }) {
        return <div className={`table-caption${sticky ? " sticky-top" : ""}${className ? ` ${className}` : ""}`}>{children}</div>;
    }

    static Footer({ children }) {
        return <div>{children}</div>;
    }

    render() {
        const { className, navigate, filter = () => false, cellTemplate: MainCellTemplate = CellTemplate, cellContext,
            useCheckboxes = false, selectOnClick = false, stickyColumnHeaders = true } = this.props;
        const { source: { items = [], parents = [] } = {} } = this.props.dataContext || {};
        this.selectables = items.filter(filter).map(i => i.id);
        const children = React.Children.toArray(this.props.children);
        const header = children.find(c => c.type === MediaBrowser.Header);
        const footer = children.find(c => c.type === MediaBrowser.Footer);
        return <div className="h-100" onMouseDown={selectOnClick ? this.onContainerMouseDown : undefined}>
            <div className={`auto-table table-compact table-hover-link table-striped${className ? ` ${className}` : ""}`} ref={this.tableRef}>
                {header}
                <div className={stickyColumnHeaders && "sticky-header"}>
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
                        <div data-id={parents[1]?.id ?? -1} onDoubleClick={navigate}>
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
                        return <div key={e.id} data-id={e.id} data-selected={selected} data-active={active}
                            onMouseDown={canBeSelected ? this.onRowMouseDown : undefined} onDoubleClick={e.container ? navigate : null}>
                            {useCheckboxes && <div>
                                <input type="checkbox" onChange={this.onCheckboxChanged} checked={selected} disabled={!filter(e)} />
                            </div>}
                            <MainCellTemplate data={e} index={index} context={cellContext} />
                            <div className="small text-nowrap text-right">{utils.formatSize(e.res?.size)}</div>
                            <div className="small">{utils.formatTime(e.res?.duration)}</div>
                            <div className="text-capitalize" title={JSON.stringify(e, null, 2)}>{utils.getDisplayName(e.class)}</div>
                        </div>;
                    })]}
                </div>
                {footer}
            </div>
        </div>;
    }
}

const CellTemplate = ({ data: { class: itemClass, albumArts, title, creator, album, res } }) =>
    <div className="d-flex align-items-center" title={utils.formatMediaInfo(res)}>
        <AlbumArt itemClass={itemClass} albumArts={albumArts} className="mr-2" />
        <div>
            {title}
            {creator && <small>&nbsp;&bull;&nbsp;{creator}</small>}
            {album && <small>&nbsp;&bull;&nbsp;{album}</small>}
        </div>
    </div>;