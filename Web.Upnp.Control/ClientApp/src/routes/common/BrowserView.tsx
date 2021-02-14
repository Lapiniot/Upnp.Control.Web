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
const HEADER_SELECTOR = ":scope > div.table-caption";
const HEADER_CELLS_SELECTOR = ":scope > div:not(.table-caption):first-of-type > div > div, :scope > div.table-caption:first-of-type + div > div > div";

type ModeFlags = "multiSelect" | "useCheckboxes" | "modalDialogMode";

export enum RowState {
    None = 0b0,
    Disabled = 0b1,
    Active = 0b10,
    Selectable = 0b100,
    Selected = 0b1000,
    Readonly = 0x10000,
    Navigable = 0x100000,
}

export type CellTemplateProps<TContext> = HTMLAttributes<HTMLDivElement> & {
    data: DIDLItem;
    index: number;
    rowState: RowState;
    context?: TContext;
};

export type BrowserProps<TContext> = {
    rowState?: ((item: DIDLItem, index: number) => RowState) | (RowState[]);
    open?: (id: string) => boolean;
    selection?: SelectionService;
    selectionChanged?: (ids: string[]) => boolean | undefined | void;
    mainCellTemplate?: ComponentType<CellTemplateProps<TContext>>;
    mainCellContext?: TContext;
} & { [K in ModeFlags]?: boolean }

export type BrowserViewProps<TContext> = BrowserProps<TContext> & HTMLAttributes<HTMLDivElement> & NavigatorProps & DataFetchProps<BrowseFetchResult>;

export default class BrowserView<TContext = unknown> extends React.Component<BrowserViewProps<TContext>> {
    state = { modal: null };
    private selection;
    private tableRef = React.createRef<HTMLDivElement>();
    private resizeObserver;
    private tracker: SelectionTracker;
    rowStates: RowState[] = [];

    constructor(props: BrowserViewProps<TContext>) {
        super(props);
        this.selection = props.selection || new SelectionService();
        this.selection.addEventListener("changed", this.selectionChangedHandler);
        this.resizeObserver = new ResizeObserver(this.resizeObservedHandler);
        this.tracker = new SelectionTracker([], this.selection, this.complexSelectionChanged);
    }

    componentDidUpdate(prevProps: BrowserViewProps<TContext>) {
        if (prevProps.selection !== this.props.selection) {
            this.selection = this.props.selection || new SelectionService();
        }
        if (prevProps.dataContext?.source !== this.props.dataContext?.source) {
            this.tracker.blur();
        }
    }

    componentDidMount() {
        document.body.addEventListener("keydown", this.onKeyDown);
        this.resizeObserver.disconnect();
        this.resizeObserver.observe(this.tableRef.current as HTMLDivElement);
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

    resizeObservedHandler: ResizeObserverCallback = entries => {
        const table = entries[0].target;

        const caption = table.querySelector<HTMLDivElement>(HEADER_SELECTOR);
        if (caption) {
            caption.style.top = `${caption.offsetTop}px`;
        }

        table.querySelectorAll<HTMLDivElement>(HEADER_CELLS_SELECTOR).forEach(cell => {
            if (cell.style.top === "")
                cell.style.top = `${cell.offsetTop}px`;
        })
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
                this.props.navigate?.({ id: parents?.[1]?.id ?? "-1" });
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

    static Caption({ className, ...other }: HTMLAttributes<HTMLDivElement>) {
        return <div className={`table-caption sticky-top${className ? ` ${className}` : ""}`} {...other} />;
    }

    static Footer(props: HTMLAttributes<HTMLDivElement>) {
        return <div {...props} />;
    }

    static ContextMenu({ children, ...other }: DropdownMenuProps) {
        return <DropdownMenu {...other}>{children}</DropdownMenu>
    }

    render() {
        const { className, rowState = () => RowState.Navigable, mainCellTemplate: MainCellTemplate = CellTemplate, mainCellContext,
            useCheckboxes = false } = this.props;

        const { source: { items = [], parents = [] } = {} } = this.props.dataContext || {};
        this.rowStates = typeof rowState === "function" ? items.map(rowState) : rowState;
        this.tracker.setup(items.map(i => i.id), this.props.selection ?? this.selection);

        const children = React.Children.toArray(this.props.children);
        const caption = children.find(c => (c as ReactElement)?.type === BrowserView.Caption);
        const footer = children.find(c => (c as ReactElement)?.type === BrowserView.Footer);
        const contextMenu = children.find(c => (c as ReactElement)?.type === BrowserView.ContextMenu);

        return <div className={`d-flex flex-column${className ? ` ${className}` : ""}`}
            onMouseDown={this.mouseEventHandler} onMouseUp={this.mouseEventHandler}>
            <div className="auto-table table-compact table-hover-link table-striped table-focus-marker"
                ref={this.tableRef} onFocus={this.focusHandler}>
                {caption}
                <div className="sticky-header">
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
                        <div data-id={parents[1]?.id ?? -1} onDoubleClick={this.navigateHandler}
                            title="Go to parent folder (you may use Backspace or LeftArrow keyboard key as well) ...">
                            {useCheckboxes && <div>&nbsp;</div>}
                            <div>
                                <svg className="icon" stroke="currentColor" viewBox="0 0 16 16">
                                    <path fillRule="evenodd" d="M4.854 1.146a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L4 2.707V12.5A2.5 2.5 0 0 0 6.5 15h8a.5.5 0 0 0 0-1h-8A1.5 1.5 0 0 1 5 12.5V2.707l3.146 3.147a.5.5 0 1 0 .708-.708l-4-4z" />
                                </svg>&nbsp;&nbsp;...
                            </div>
                            <div>&nbsp;</div>
                            <div>&nbsp;</div>
                            <div>Parent</div>
                        </div>}
                    {[items.map((e, index) => {
                        const selected = this.selection.selected(e.id);
                        const selectable = !!(this.rowStates[index] & RowState.Selectable);
                        return <div key={e.id} tabIndex={0} data-id={e.id} data-selected={selected ? selected : undefined}
                            data-active={this.rowStates[index] & RowState.Active ? true : undefined}
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
                {footer}
            </div>
            {contextMenu}
        </div>;
    }
}

export function CellTemplate({ children, data, index, rowState, context, ...other }: CellTemplateProps<unknown>) {
    const { class: itemClass, albumArts, title, creator, album, res } = data;
    return <div className="d-flex align-items-center" title={utils.formatMediaInfo(res) ?? undefined} {...other}>
        <AlbumArt itemClass={itemClass} albumArts={albumArts} className="me-2" />
        <span className="text-truncate flex-grow-1">
            {title}
            {creator && <>&nbsp;&bull;&nbsp;<small>{creator}</small></>}
            {album && <>&nbsp;&bull;&nbsp;<small>{album}</small></>}
        </span>
        {children}
    </div>;
}