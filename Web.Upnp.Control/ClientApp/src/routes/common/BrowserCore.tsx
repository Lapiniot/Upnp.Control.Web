import React, { ChangeEventHandler, ComponentType, HTMLAttributes, MouseEventHandler, ReactElement, MouseEvent, FocusEvent } from "react";
import AlbumArt from "./AlbumArt";
import SelectionService from "../../components/SelectionService";
import { DIDLUtils as utils } from "./BrowserUtils";
import { BrowseFetchResult, DIDLItem } from "./Types";
import { NavigatorProps } from "./Navigator";
import { DataFetchProps } from "../../components/DataFetch";
import { DropdownMenu, DropdownMenuProps } from "../../components/DropdownMenu";
import { EventHint, SelectionTracker } from "../../components/SelectionTracker";

const DATA_ROW_SELECTOR = "div[data-id]";
const DATA_ROW_FOCUSED_SELECTOR = "div[data-id]:focus";
const DATA_ROW_FOCUS_WITHIN_SELECTOR = "div[data-id]:focus,div[data-id] :focus";

type ModeFlags = "multiSelect" | "useCheckboxes" | "selectOnClick" | "modalDialogMode" | "stickyColumnHeaders";

export enum RowState {
    None = 0b0,
    Disabled = 0b1,
    Active = 0b10,
    Selectable = 0b100,
    Selected = 0b1000,
    Readonly = 0x10000,
    Navigable = 0x100000,
}

export type BrowserCoreProps<TContext = {}> = {
    rowState?: ((item: DIDLItem, index: number) => RowState) | (RowState[]);
    open?: (id: string) => boolean;
    selection?: SelectionService;
    selectionChanged?: (ids: string[]) => boolean | undefined | void;
    mainCellTemplate?: ComponentType<{ data: DIDLItem, index: number, rowState: RowState, context?: TContext }>;
    mainCellContext?: TContext;
} & { [K in ModeFlags]?: boolean }

type MediaBrowserState = {}

type PropsType<TContext> = BrowserCoreProps<TContext> & HTMLAttributes<HTMLDivElement> & NavigatorProps & DataFetchProps<BrowseFetchResult>;

export default class MediaBrowser<P = {}> extends React.Component<PropsType<P>, MediaBrowserState> {
    state = { modal: null };
    private selection;
    private tableRef = React.createRef<HTMLDivElement>();
    private resizeObserver;
    private tracker: SelectionTracker;
    rowStates: RowState[] = [];

    constructor(props: PropsType<P>) {
        super(props);
        this.selection = props.selection || new SelectionService();
        this.selection.addEventListener("changed", this.selectionChangedHandler);
        this.resizeObserver = new ResizeObserver(this.onCaptionResized);
        this.tracker = new SelectionTracker([], this.selection, this.complexSelectionChanged);
    }

    componentDidUpdate(prevProps: PropsType<P>) {
        if (prevProps.selection !== this.props.selection) {
            this.selection = this.props.selection || new SelectionService();
        }
        if (prevProps.dataContext?.source !== this.props.dataContext?.source) {
            this.tracker.blur();
        }
    }

    componentDidMount() {
        document.body.addEventListener("keydown", this.onKeyDown);

        const scope = this.tableRef.current;
        const caption = scope?.querySelector<HTMLDivElement>("div.table-caption:first-of-type");

        if (caption) {
            this.resizeObserver.disconnect();
            this.resizeObserver.observe(caption);
        }
        else {
            const headers = scope?.querySelectorAll<HTMLDivElement>(`div:nth-of-type(${caption ? 2 : 1}) > div > div`);
            this.adjustStickyElements(caption ?? undefined, headers);
        }
    }

    private selectionFilter = (item: DIDLItem, index: number) => {
        return (this.rowStates[index] & RowState.Selectable) && this.selection.selected(item.id);
    }

    private selectionChangedHandler = (event: Event) => {
        const { selectionChanged, dataContext } = this.props;
        if (selectionChanged && dataContext) {
            const { source: { items } = { items: null } } = dataContext;
            if (items) {
                if (selectionChanged(items.filter(this.selectionFilter).map(item => item.id)) === false) {
                    event.preventDefault();
                }
            }
        }
    }

    componentWillUnmount() {
        document.body.removeEventListener("keydown", this.onKeyDown);
        this.resizeObserver.disconnect();
        this.selection.clear();
    }

    onCaptionResized: ResizeObserverCallback = entries => {
        const caption = entries[0].target;
        const headers = caption?.nextSibling?.firstChild?.childNodes;
        this.adjustStickyElements(caption as HTMLElement, headers as NodeListOf<HTMLElement>);
    }

    adjustStickyElements(caption: HTMLElement | undefined, headers: NodeListOf<HTMLElement> | undefined) {
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

    onCheckboxChanged: ChangeEventHandler<HTMLInputElement> = e => {
        e.stopPropagation();
        const checkbox = e.target;
        const id = checkbox.parentElement?.parentElement?.dataset?.id;
        if (!id) return;
        this.tracker.set(id, checkbox.checked);
    };

    onCheckboxAllChanged: ChangeEventHandler<HTMLInputElement> = e => {
        const checkbox = e.target;
        this.tracker.setAll(checkbox.checked);
    };

    private mouseEventHandler = (e: MouseEvent<HTMLDivElement>) => {

        const target = e.target as HTMLElement;

        if (target === e.currentTarget && this.selection.any()) {
            this.tracker.setAll(false, EventHint.Mouse);
            e.preventDefault();
            e.stopPropagation();
        } else {
            if (target instanceof HTMLInputElement || target.closest("button")) return;

            const row = target.closest<HTMLElement>(DATA_ROW_SELECTOR);
            if (!row) return;

            const id = row.dataset.id;

            if (!id || !this.tracker.enabled()) return;

            if (e.shiftKey || e.ctrlKey || e.metaKey) {
                if (!this.props.multiSelect || e.type !== "mousedown") return;
                if ((e.ctrlKey || e.metaKey))
                    this.tracker.toggle(id, EventHint.Mouse);
                else
                    this.tracker.expandTo(id, EventHint.Mouse);
                e.preventDefault();
                e.stopPropagation();
            }
            else {
                if (e.type === "mouseup")
                    this.tracker.setOnly(id, EventHint.Mouse);
                e.preventDefault();
                e.stopPropagation();
            }
        }
    }

    private onKeyDown = (event: KeyboardEvent) => {
        if (!this.tracker.enabled() || (!this.props.modalDialogMode && document.body.classList.contains("modal-open"))) return;

        switch (event.code) {
            case "Enter":
            case "ArrowRight":
                const focusedRow = this.tableRef.current?.querySelector<HTMLDivElement>(DATA_ROW_FOCUSED_SELECTOR);

                if (!focusedRow) {
                    if (event.code === "ArrowRight")
                        this.tracker.selectFirst();
                    return;
                }

                if (event.code === "Enter" && event.target !== focusedRow) return;

                const items = this.props.dataContext?.source.items;
                if (!items) return;
                const index = items.findIndex(i => i.id === focusedRow.dataset.id);
                const item = items[index];
                if (!item) return;
                const state = this.getRowState(item, index);
                if (item.container && state & RowState.Navigable)
                    this.props.navigate?.({ id: item.id });
                else if (state ^ RowState.Readonly && event.code === "Enter")
                    this.props.open?.(item.id);

                break;
            case "Backspace":
            case "ArrowLeft":
                const parents = this.props.dataContext?.source.parents;
                this.props.navigate?.({ id: parents?.[1].id ?? "-1" });
                break;
            case "KeyA":
                if (this.props.multiSelect && !event.cancelBubble && (event.metaKey || event.ctrlKey)) {
                    this.tracker.setAll(true, EventHint.Keyboard);
                    event.preventDefault();
                    event.stopPropagation();
                }
                break;
            case "ArrowUp":
                if (event.shiftKey)
                    this.tracker.expandUp(EventHint.Keyboard);
                else
                    this.tracker.movePrev(EventHint.Keyboard);
                break;
            case "ArrowDown":
                if (event.shiftKey)
                    this.tracker.expandDown(EventHint.Keyboard)
                else
                    this.tracker.moveNext(EventHint.Keyboard);
                break;
            case "Tab":
                break;
            default: return;
        }
    }

    private focusHandler = (event: FocusEvent<HTMLDivElement>) => {
        const row = event.target.matches(DATA_ROW_SELECTOR) && event.target as HTMLDivElement;
        if (row) {
            const id = row.dataset.id;
            if (id && id !== this.tracker.focus) {
                // last tracked focused item id doesn't match currently focused row -
                // thus we came here as a result of focus switch via keyboard Tab or Shift+Tab
                // which we don't emulate programmatically. So lets synchronize selection with news focus
                this.tracker.setOnly(id, EventHint.Keyboard);
            }
        }
    }

    private complexSelectionChanged = (_ids: string[], focused: string | null, hint: EventHint, canceled: boolean) => {
        if (focused) {
            const row = this.tableRef.current?.querySelector<HTMLDivElement>(`div[data-id='${focused}']`);
            if (!row) return;

            if (!row.matches(":focus-within")) {
                if (hint & EventHint.Keyboard)
                    row.scrollIntoView({ block: "center", behavior: "smooth" });
                row.focus({ preventScroll: true });
            }
        }
        else {
            const element = this.tableRef.current?.querySelector<HTMLDivElement>(DATA_ROW_FOCUS_WITHIN_SELECTOR);
            element?.blur();
        }

        if (!canceled) {
            this.setState({ selection: true });
        }
    }

    private navigateHandler = ({ currentTarget: { dataset } }: MouseEvent<HTMLDivElement>) => {
        this.props.navigate(dataset);
    }

    private open: MouseEventHandler<HTMLDivElement> = ({ currentTarget: { dataset: { id } } }) =>
        this.props.open?.(id as string);

    private getRowState(item: DIDLItem, index: number) {
        return (typeof this.props.rowState === "function"
            ? this.props.rowState(item, index)
            : this.props.rowState?.[index])
            ?? RowState.Navigable;
    }

    static Header({ className, sticky = true, ...other }: HTMLAttributes<HTMLDivElement> & { sticky?: boolean }) {
        return <div className={`table-caption${sticky ? " sticky-top" : ""}${className ? ` ${className}` : ""}`} {...other} />;
    }

    static Footer(props: HTMLAttributes<HTMLDivElement>) {
        return <div {...props} />;
    }

    static ContextMenu({ children, ...other }: DropdownMenuProps) {
        return <DropdownMenu {...other}>{children}</DropdownMenu>
    }

    render() {
        const { className, rowState = () => RowState.Navigable, mainCellTemplate: MainCellTemplate = CellTemplate, mainCellContext,
            useCheckboxes = false, selectOnClick = false, stickyColumnHeaders = true } = this.props;

        const { source: { items = [], parents = [] } = {} } = this.props.dataContext || {};
        this.rowStates = typeof rowState === "function" ? items.map(rowState) : rowState;
        this.tracker.setup(items.map(i => i.id), this.props.selection ?? this.selection);

        const children = React.Children.toArray(this.props.children);
        const header = children.find(c => (c as ReactElement)?.type === MediaBrowser.Header);
        const footer = children.find(c => (c as ReactElement)?.type === MediaBrowser.Footer);
        const contextMenu = children.find(c => (c as ReactElement)?.type === MediaBrowser.ContextMenu);

        return <div className={`d-flex flex-grow-1 flex-column${className ? ` ${className}` : ""}`}
            onMouseDown={selectOnClick ? this.mouseEventHandler : undefined}
            onMouseUp={selectOnClick ? this.mouseEventHandler : undefined}>
            <div className="auto-table table-compact table-hover-link table-striped table-focus-marker w-100 mw-100"
                ref={this.tableRef} onFocus={this.focusHandler}>
                {header}
                <div className={stickyColumnHeaders ? "sticky-header" : undefined}>
                    <div>
                        {useCheckboxes &&
                            <div>
                                <input type="checkbox" id="select_all" onChange={this.onCheckboxAllChanged}
                                    checked={this.tracker.allSelected()} disabled={!this.tracker.enabled()} />
                            </div>}
                        <div className="w-100">Name</div>
                        <div>Size</div>
                        <div>Time</div>
                        <div>Kind</div>
                    </div>
                </div>
                <div>
                    {parents && parents.length > 0 &&
                        <div data-id={parents[1]?.id ?? -1} onDoubleClick={this.navigateHandler}>
                            {useCheckboxes && <div>&nbsp;</div>}
                            <div>...</div>
                            <div>&nbsp;</div>
                            <div>&nbsp;</div>
                            <div>Parent</div>
                        </div>}
                    {[items.map((e, index) => {
                        const selected = this.selection.selected(e.id);
                        const selectable = !!(this.rowStates[index] & RowState.Selectable);
                        return <div key={e.id} tabIndex={0} data-id={e.id} data-selected={selected} data-active={!!(this.rowStates[index] & RowState.Active)}
                            onDoubleClick={e.container && (this.rowStates[index] & RowState.Navigable) ? this.navigateHandler : this.open}>
                            {useCheckboxes && <div>
                                <input type="checkbox" onChange={this.onCheckboxChanged} checked={selected && selectable} disabled={!selectable} />
                            </div>}
                            <div className="mw-1"><MainCellTemplate data={e} index={index} context={mainCellContext} rowState={this.rowStates[index]} /></div>
                            <div className="small text-end">{utils.formatSize(e.res?.size)}</div>
                            <div className="small">{utils.formatTime(e.res?.duration)}</div>
                            <div className="text-capitalize" title={JSON.stringify(e, null, 2)}>{utils.getDisplayName(e.class)}</div>
                        </div>;
                    })]}
                </div>
                {contextMenu}
                {footer}
            </div>
        </div>;
    }
}

const CellTemplate = ({ data: { class: itemClass, albumArts, title, creator, album, res } }: { data: DIDLItem }) =>
    <div className="d-flex align-items-center" title={utils.formatMediaInfo(res) ?? undefined}>
        <AlbumArt itemClass={itemClass} albumArts={albumArts} className="me-2" />
        <span className="text-truncate">
            {title}
            {creator && <>&nbsp;&bull;&nbsp;<small>{creator}</small></>}
            {album && <>&nbsp;&bull;&nbsp;<small>{album}</small></>}
        </span>
    </div>