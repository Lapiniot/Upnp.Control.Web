import React, { ChangeEventHandler, ComponentType, HTMLAttributes, MouseEventHandler, ReactElement, MouseEvent, FocusEvent } from "react";
import AlbumArt from "./AlbumArt";
import { DIDLUtils as utils } from "./BrowserUtils";
import { BrowseFetchResult, DIDLItem, RowState } from "./Types";
import { NavigatorProps } from "./Navigator";
import { DataFetchProps } from "../../components/DataFetch";
import { DropdownMenu, DropdownMenuProps } from "../../components/DropdownMenu";
import { findScrollParent } from "../../components/Extensions";
import { EventHint, SelectionTracker } from "./SelectionTracker";

const DATA_ROW_SELECTOR = "div[data-index]";
const DATA_ROW_FOCUSED_SELECTOR = "div[data-index]:focus";
const DATA_ROW_FOCUS_WITHIN_SELECTOR = "div[data-index]:focus,div[data-index] :focus";
const HEADER_SELECTOR = ":scope > div.table-caption";
const HEADER_CELLS_SELECTOR = ":scope > div:not(.table-caption):first-of-type > div > div, :scope > div.table-caption:first-of-type + div > div > div";

type ModeFlags = "multiSelect" | "useCheckboxes" | "modalDialogMode";

export type CellTemplateProps<TContext> = HTMLAttributes<HTMLDivElement> & {
    data: DIDLItem;
    index: number;
    rowState: RowState;
    context?: TContext;
};

export type BrowserProps<TContext> = {
    rowState?: ((item: DIDLItem, index: number) => RowState) | (RowState[]);
    open?: (id: string) => boolean;
    selectionChanged?: (ids: string[]) => boolean | undefined | void;
    mainCellTemplate?: ComponentType<CellTemplateProps<TContext>>;
    mainCellContext?: TContext;
} & { [K in ModeFlags]?: boolean }

export type BrowserViewProps<TContext> = BrowserProps<TContext> & HTMLAttributes<HTMLDivElement> & NavigatorProps & DataFetchProps<BrowseFetchResult>;

export default class BrowserView<TContext = unknown> extends React.Component<BrowserViewProps<TContext>> {
    state = { modal: null };
    //private selection;
    private tableRef = React.createRef<HTMLDivElement>();
    private resizeObserver;
    private tracker: SelectionTracker;
    rowStates: RowState[] = [];

    constructor(props: BrowserViewProps<TContext>) {
        super(props);
        this.resizeObserver = new ResizeObserver(this.resizeObservedHandler);
        this.tracker = new SelectionTracker([], this.selectionChanged);
    }

    componentDidUpdate(prevProps: BrowserViewProps<TContext>) {
        if (prevProps.dataContext?.source !== this.props.dataContext?.source) {
            const { rowState = [], dataContext: ctx } = this.props;
            this.rowStates = typeof rowState === "function" ? ctx?.source?.items?.map(rowState) ?? [] : rowState;
            this.tracker = new SelectionTracker(this.rowStates, this.selectionChanged);
            this.props.selectionChanged?.([]);
        }
    }

    componentDidMount() {
        document.body.addEventListener("keydown", this.onKeyDown);
        this.resizeObserver.disconnect();
        this.resizeObserver.observe(this.tableRef.current as HTMLDivElement);
    }

    componentWillUnmount() {
        document.body.removeEventListener("keydown", this.onKeyDown);
        this.resizeObserver.disconnect();
    }

    resizeObservedHandler = (entries: ResizeObserverEntry[]) => {
        const table = entries[0].target;

        const scrollParent = findScrollParent(table as HTMLElement);
        if (!scrollParent) return;

        let offset = table.getBoundingClientRect().top + table.clientTop
            - scrollParent.getBoundingClientRect().top - scrollParent.clientTop;

        const caption = table.querySelector<HTMLDivElement>(HEADER_SELECTOR);
        if (caption) {
            const rect = caption.getBoundingClientRect();
            caption.style.top = `${Math.round(offset)}px`;
            offset += rect.height;
        }

        const top = `${Math.round(offset)}px`;
        const headers = table.querySelectorAll<HTMLDivElement>(HEADER_CELLS_SELECTOR);
        headers.forEach(cell => { cell.style.top = top; });
    }

    onCheckboxChanged: ChangeEventHandler<HTMLInputElement> = e => {
        e.stopPropagation();
        const checkbox = e.target;
        const index = checkbox.parentElement?.parentElement?.dataset?.index;
        if (!index) return;
        this.tracker.set(parseInt(index), checkbox.checked);
    };

    onCheckboxAllChanged: ChangeEventHandler<HTMLInputElement> = e => {
        const checkbox = e.target;
        this.tracker.setAll(checkbox.checked);
    };

    private mouseEventHandler = (e: MouseEvent<HTMLDivElement>) => {

        const target = e.target as HTMLElement;

        if (target === e.currentTarget) {
            this.tracker.setAll(false, EventHint.Mouse);
            e.preventDefault();
            e.stopPropagation();
        } else {
            if (target instanceof HTMLInputElement || target.closest("button")) return;

            const row = target.closest<HTMLElement>(DATA_ROW_SELECTOR);
            if (!row) return;

            const index = row.dataset.index;

            if (!index || !this.tracker.enabled()) return;

            if (e.shiftKey || e.ctrlKey || e.metaKey) {
                if (!this.props.multiSelect || e.type !== "mousedown") return;
                if ((e.ctrlKey || e.metaKey))
                    this.tracker.toggle(parseInt(index), EventHint.Mouse);
                else
                    this.tracker.expandTo(parseInt(index), EventHint.Mouse);
                e.preventDefault();
                e.stopPropagation();
            }
            else {
                if (e.type === "mouseup")
                    this.tracker.setOnly(parseInt(index), EventHint.Mouse);
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
                const index = parseInt(focusedRow.dataset.index ?? "");
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
            default: return;
        }
    }

    private focusHandler = (event: FocusEvent<HTMLDivElement>) => {
        const row = event.target.matches(DATA_ROW_SELECTOR) && event.target as HTMLDivElement;
        if (row) {
            if (!row.dataset.index) return;
            const index = parseInt(row.dataset.index);
            if (index && index !== this.tracker.focus) {
                // last tracked focused item id doesn't match currently focused row -
                // thus we came here as a result of focus switch via keyboard Tab or Shift+Tab
                // which we don't emulate programmatically. So lets synchronize selection with news focus
                this.tracker.setOnly(index, EventHint.Keyboard);
            }
        }
    }

    private selectionChanged = (indeeces: number[], focused: number | null, hint: EventHint) => {
        if (focused) {
            const row = this.tableRef.current?.querySelector<HTMLDivElement>(`div[data-index="${focused}"]`);
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

        const { selectionChanged, dataContext: ctx } = this.props;

        if (!ctx?.source.items) return;

        const { source: { items } } = ctx;

        if (selectionChanged?.(indeeces.map(i => items[i].id)) !== false) {
            this.forceUpdate();
        }
    }

    private navigateHandler = ({ currentTarget: { dataset: { index, id } } }: MouseEvent<HTMLDivElement>) => {
        if (id) {
            this.props.navigate({ id });
        }
        else if (index) {
            this.props.navigate({ id: this.props.dataContext?.source?.items?.[parseInt(index)]?.id });
        }
    }

    private open: MouseEventHandler<HTMLDivElement> = ({ currentTarget: { dataset: { id, index } } }) => {
        if (id)
            this.props.open?.(id);
        else if (index)
            this.props.open?.(id ?? this.props.dataContext?.source.items?.[parseInt(index)]?.id ?? "");

    }

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
        const { className, mainCellTemplate: MainCellTemplate = CellTemplate, mainCellContext,
            useCheckboxes = false } = this.props;

        const { source: { items = [], parents = [] } = {} } = this.props.dataContext || {};

        const children = React.Children.toArray(this.props.children);
        const caption = children.find(c => (c as ReactElement)?.type === BrowserView.Caption);
        const footer = children.find(c => (c as ReactElement)?.type === BrowserView.Footer);
        const contextMenu = children.find(c => (c as ReactElement)?.type === BrowserView.ContextMenu);

        return <div className={`d-flex flex-column pb-3${className ? ` ${className}` : ""}`}
            onMouseDown={this.mouseEventHandler} onMouseUp={this.mouseEventHandler}>
            <div className="auto-table table-material trim-sm-3 hide-md-3 hide-md-5 hide-lg-5"
                ref={this.tableRef} onFocus={this.focusHandler}>
                {caption}
                <div className="sticky-header d-none-h-before-sm">
                    <div>
                        {useCheckboxes &&
                            <div>
                                <input type="checkbox" onChange={this.onCheckboxAllChanged}
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
                            <div className="w-100">
                                <svg className="icon" stroke="currentColor" viewBox="0 0 16 16">
                                    <path fillRule="evenodd" d="M4.854 1.146a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L4 2.707V12.5A2.5 2.5 0 0 0 6.5 15h8a.5.5 0 0 0 0-1h-8A1.5 1.5 0 0 1 5 12.5V2.707l3.146 3.147a.5.5 0 1 0 .708-.708l-4-4z" />
                                </svg>&nbsp;&nbsp;...
                            </div>
                            <div>&nbsp;</div>
                            <div>&nbsp;</div>
                            <div>Parent</div>
                        </div>}
                    {[items.map((e, index) => {
                        const selected = !!(this.rowStates[index] & RowState.Selected);
                        const selectable = !!(this.rowStates[index] & RowState.Selectable);
                        return <div key={e.id} tabIndex={0} data-index={index} data-selected={selected ? selected : undefined}
                            data-active={this.rowStates[index] & RowState.Active ? true : undefined}
                            onDoubleClick={e.container && (this.rowStates[index] & RowState.Navigable) ? this.navigateHandler : this.open}>
                            {useCheckboxes && <div>
                                <input type="checkbox" onChange={this.onCheckboxChanged} checked={selected && selectable} disabled={!selectable} />
                            </div>}
                            <div className="mw-1"><MainCellTemplate data={e} index={index} context={mainCellContext} rowState={this.rowStates[index]} /></div>
                            <div className="small text-end">{utils.formatSize(e.res?.size)}</div>
                            <div className="small">{utils.formatTime(e.res?.duration)}</div>
                            <div className="text-capitalize">{utils.getDisplayName(e.class)}</div>
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