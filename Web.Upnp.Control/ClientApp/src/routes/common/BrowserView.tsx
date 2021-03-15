﻿import React, { ChangeEventHandler, ComponentType, HTMLAttributes, MouseEventHandler, ReactElement, MouseEvent, FocusEvent } from "react";
import AlbumArt from "./AlbumArt";
import { DIDLUtils as utils } from "./BrowserUtils";
import { BrowseFetchResult, DIDLItem, RowState } from "./Types";
import { NavigatorProps } from "./Navigator";
import { DataFetchProps } from "../../components/DataFetch";
import { DropdownMenu, DropdownMenuProps } from "../../components/DropdownMenu";
import { findScrollParent, nopropagation } from "../../components/Extensions";
import { EventHint, SelectionStateAdapter } from "./SelectionStateAdapter";

const DATA_ROW_SELECTOR = "div[data-index]";
const DATA_ROW_FOCUSED_SELECTOR = "div[data-index]:focus";
const HEADER_SELECTOR = ":scope > div.table-caption";
const HEADER_CELLS_SELECTOR = ":scope > div:not(.table-caption):first-of-type > div > div, :scope > div.table-caption:first-of-type + div > div > div";

type ModeFlags = "multiSelect" | "useCheckboxes" | "modalDialogMode";

type DisplayMode = "table" | "list" | "responsive";

type NavigationMode = "single-tap" | "double-click";

export type CellTemplateProps<TContext> = HTMLAttributes<HTMLDivElement> & {
    data: DIDLItem;
    index: number;
    rowState: RowState;
    context?: TContext;
};

export type BrowserProps<TContext> = {
    rowState?: ((item: DIDLItem, index: number) => RowState) | (RowState[]);
    open?: (index: number) => boolean;
    selectionChanged?: (ids: string[]) => boolean | undefined | void;
    mainCellTemplate?: ComponentType<CellTemplateProps<TContext>>;
    mainCellContext?: TContext;
    displayMode?: DisplayMode;
    navigationMode?: NavigationMode;
} & { [K in ModeFlags]?: boolean }

export type BrowserViewProps<TContext> = BrowserProps<TContext> & HTMLAttributes<HTMLDivElement> & NavigatorProps & DataFetchProps<BrowseFetchResult>;

export default class BrowserView<TContext = unknown> extends React.Component<BrowserViewProps<TContext>> {
    state = { modal: null };
    private tableRef = React.createRef<HTMLDivElement>();
    private resizeObserver;
    private adapter: SelectionStateAdapter;
    rowStates: RowState[] = [];
    largeScreenQuery: MediaQueryList;

    constructor(props: BrowserViewProps<TContext>) {
        super(props);
        this.resizeObserver = new ResizeObserver(this.resizeObservedHandler);
        this.adapter = new SelectionStateAdapter([], null, this.selectionChanged);
        this.largeScreenQuery = matchMedia("(min-width: 1024px)");
        this.updateCachedState();
    }

    componentDidUpdate(prevProps: BrowserViewProps<TContext>) {
        if (prevProps.dataContext?.source !== this.props.dataContext?.source
            || prevProps.rowState !== this.props.rowState) {
            this.updateCachedState();
            this.props.selectionChanged?.([]);
        }
    }

    componentDidMount() {
        document.body.addEventListener("keydown", this.onKeyDown);
        this.largeScreenQuery.addEventListener("change", this.screenSizeChanged);
        this.resizeObserver.disconnect();
        this.resizeObserver.observe(this.tableRef.current as HTMLDivElement);
    }

    componentWillUnmount() {
        this.largeScreenQuery.removeEventListener("change", this.screenSizeChanged);
        document.body.removeEventListener("keydown", this.onKeyDown);
        this.resizeObserver.disconnect();
    }

    screenSizeChanged = () => this.forceUpdate();

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
        this.adapter.set(parseInt(index), checkbox.checked);
    };

    onCheckboxAllChanged: ChangeEventHandler<HTMLInputElement> = e => {
        const checkbox = e.target;
        this.adapter.setAll(checkbox.checked);
    };

    noopHandler = nopropagation(() => { });

    private mouseEventHandler = (e: MouseEvent<HTMLDivElement>) => {

        const target = e.target as HTMLElement;

        if (target === e.currentTarget) {
            this.adapter.setAll(false, EventHint.Mouse);
            e.preventDefault();
            e.stopPropagation();
        } else {
            if (target instanceof HTMLInputElement || target.closest("button")) return;

            const row = target.closest<HTMLElement>(DATA_ROW_SELECTOR);
            if (!row) return;

            const index = row.dataset.index;

            if (!index || !this.adapter.enabled()) return;

            if (e.shiftKey || e.ctrlKey || e.metaKey) {
                if (!this.props.multiSelect || e.type !== "mousedown") return;
                if ((e.ctrlKey || e.metaKey))
                    this.adapter.toggle(parseInt(index), EventHint.Mouse);
                else
                    this.adapter.expandTo(parseInt(index), EventHint.Mouse);
                e.preventDefault();
                e.stopPropagation();
            }
            else {
                if (e.type === "mouseup")
                    this.adapter.setOnly(parseInt(index), EventHint.Mouse);
                e.preventDefault();
                e.stopPropagation();
            }
        }
    }

    private onKeyDown = (event: KeyboardEvent) => {
        if (!this.adapter.enabled() || (!this.props.modalDialogMode && document.body.classList.contains("modal-open"))) return;

        switch (event.code) {
            case "Enter":
            case "ArrowRight":
                const focusedRow = this.tableRef.current?.querySelector<HTMLDivElement>(DATA_ROW_FOCUSED_SELECTOR);

                if (!focusedRow) {
                    if (event.code === "ArrowRight")
                        this.adapter.selectFirst();
                    return;
                }

                if (event.code === "Enter" && event.target !== focusedRow) return;

                const items = this.props.dataContext?.source.items;
                if (!items) return;
                const index = parseInt(focusedRow.dataset.index ?? "");
                const item = items[index];
                if (!item) return;
                const state = this.rowStates[index];
                if (item.container && state & RowState.Navigable)
                    this.props.navigate?.({ id: item.id });
                else if (state ^ RowState.Readonly && event.code === "Enter")
                    this.props.open?.(index);

                break;
            case "Backspace":
            case "ArrowLeft":
                const parents = this.props.dataContext?.source.parents;
                this.props.navigate?.({ id: parents?.[1]?.id ?? "-1" });
                break;
            case "KeyA":
                if (this.props.multiSelect && !event.cancelBubble && (event.metaKey || event.ctrlKey)) {
                    this.adapter.setAll(true, EventHint.Keyboard);
                    event.preventDefault();
                    event.stopPropagation();
                }
                break;
            case "ArrowUp":
                if (event.shiftKey)
                    this.adapter.expandUp(EventHint.Keyboard);
                else
                    this.adapter.movePrev(EventHint.Keyboard);
                break;
            case "ArrowDown":
                if (event.shiftKey)
                    this.adapter.expandDown(EventHint.Keyboard)
                else
                    this.adapter.moveNext(EventHint.Keyboard);
                break;
            default: return;
        }
    }

    private focusHandler = (event: FocusEvent<HTMLDivElement>) => {
        const row = event.target.matches(DATA_ROW_SELECTOR) && event.target as HTMLDivElement;
        if (row) {
            if (!row.dataset.index) return;
            const index = parseInt(row.dataset.index);
            if (index && index !== this.adapter.focus) {
                // last tracked focused item id doesn't match currently focused row -
                // thus we came here as a result of focus switch via keyboard Tab or Shift+Tab
                // which we don't emulate programmatically. So lets synchronize selection with news focus
                this.adapter.setOnly(index, EventHint.Keyboard);
            }
        }
    }

    private selectionChanged = (indeeces: number[], focused: number | null, hint: EventHint) => {
        if (focused) {
            const row = this.tableRef.current?.querySelector<HTMLDivElement>(`div[data-index="${focused}"]`);
            if (!row) return;

            if (!row.matches(":focus")) {
                if (hint & EventHint.Keyboard)
                    row.scrollIntoView({ block: "center", behavior: "smooth" });
                row.focus({ preventScroll: true });
            }
        }
        else {
            const element = this.tableRef.current?.querySelector<HTMLDivElement>(DATA_ROW_FOCUSED_SELECTOR);
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

    private open: MouseEventHandler<HTMLDivElement> = ({ currentTarget: { dataset: { index } } }) => {
        if (!index) return;
        this.props.open?.(parseInt(index));

    }

    private updateCachedState() {
        const { rowState, dataContext: ctx } = this.props;
        this.rowStates = (typeof rowState === "function" ? ctx?.source.items?.map(rowState) : rowState) ?? [];
        this.adapter = new SelectionStateAdapter(this.rowStates, this.adapter.focus, this.selectionChanged);
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
            useCheckboxes = false, displayMode = "responsive", navigationMode: mode = "single-tap" } = this.props;

        const { source: { items = [], parents = [] } = {} } = this.props.dataContext || {};

        const children = React.Children.toArray(this.props.children);
        const caption = children.find(c => (c as ReactElement)?.type === BrowserView.Caption);
        const footer = children.find(c => (c as ReactElement)?.type === BrowserView.Footer);
        const contextMenu = children.find(c => (c as ReactElement)?.type === BrowserView.ContextMenu);

        const tableMode = displayMode === "table" || displayMode === "responsive" && this.largeScreenQuery.matches;

        return <div className={`d-flex flex-column pb-3${className ? ` ${className}` : ""}`}
            onMouseDown={this.mouseEventHandler} onMouseUp={this.mouseEventHandler}>
            <div className="auto-table table-material trim-sm-3 hide-md-3 hide-md-5 hide-lg-5"
                ref={this.tableRef} onFocus={this.focusHandler}>
                {caption}
                <div className={tableMode ? "sticky-header" : "d-none"}>
                    <div>
                        {useCheckboxes &&
                            <div>
                                <input type="checkbox" onChange={this.onCheckboxAllChanged}
                                    checked={this.adapter.allSelected()} disabled={!this.adapter.enabled()} />
                            </div>}
                        <div className="w-100">Name</div>
                        <div>Size</div>
                        <div>Time</div>
                        <div>Kind</div>
                    </div>
                </div>
                <div>
                    {parents && parents.length > 0 &&
                        <div data-id={parents[1]?.id ?? -1} title="Go to parent folder (you may use Backspace or LeftArrow keyboard key as well) ..."
                            onDoubleClick={mode === "double-click" ? this.navigateHandler : undefined}
                            onClick={mode === "single-tap" ? this.navigateHandler : undefined}>
                            {useCheckboxes && <div>&nbsp;</div>}
                            <div className="w-100">
                                <svg className="icon" stroke="currentColor" viewBox="0 0 16 16">
                                    <path fillRule="evenodd" d="M4.854 1.146a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L4 2.707V12.5A2.5 2.5 0 0 0 6.5 15h8a.5.5 0 0 0 0-1h-8A1.5 1.5 0 0 1 5 12.5V2.707l3.146 3.147a.5.5 0 1 0 .708-.708l-4-4z" />
                                </svg>&nbsp;&nbsp;...
                            </div>
                            {tableMode && <>
                                <div>&nbsp;</div>
                                <div>&nbsp;</div>
                                <div>Parent</div>
                            </>}
                        </div>}
                    {[items.map((e, index) => {
                        const selected = !!(this.rowStates[index] & RowState.Selected);
                        const selectable = !!(this.rowStates[index] & RowState.Selectable);
                        const active = this.rowStates[index] & RowState.Active ? true : undefined;
                        const handler = e.container && (this.rowStates[index] & RowState.Navigable) ? this.navigateHandler : this.open;
                        return <div key={e.id} tabIndex={0} data-index={index} data-selected={selected ? selected : undefined} data-active={active}
                            onDoubleClick={mode === "double-click" ? handler : undefined} onClick={mode === "single-tap" ? handler : undefined} >
                            {useCheckboxes && <div>
                                <input type="checkbox" onChange={this.onCheckboxChanged} onClick={this.noopHandler} checked={selected && selectable} disabled={!selectable} />
                            </div>}
                            <div className="mw-1"><MainCellTemplate data={e} index={index} context={mainCellContext} rowState={this.rowStates[index]} /></div>
                            {tableMode && <>
                                <div className="small text-end">{utils.formatSize(e.res?.size)}</div>
                                <div className="small">{utils.formatTime(e.res?.duration)}</div>
                                <div className="text-capitalize">{utils.getDisplayName(e.class)}</div>
                            </>}
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