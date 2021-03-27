import React, { ChangeEventHandler, ComponentType, FocusEvent, HTMLAttributes, MouseEvent, ReactElement, RefObject } from "react";
import { DataContext, DataFetchProps } from "../../components/DataFetch";
import { DropdownMenu, DropdownMenuProps } from "../../components/DropdownMenu";
import { findScrollParent } from "../../components/Extensions";
import { MediaQueries } from "../../components/MediaQueries";
import AlbumArt from "./AlbumArt";
import { DIDLUtils as utils } from "./BrowserUtils";
import { NavigatorProps } from "./Navigator";
import { SelectionStateAdapter } from "./SelectionStateAdapter";
import { BrowseFetchResult, DIDLItem, RowState } from "./Types";

const DATA_ROW_SELECTOR = "div[data-index]";
const DATA_ROW_FOCUSED_SELECTOR = "div[data-index]:focus";
const HEADER_SELECTOR = ":scope > div.table-caption";
const HEADER_CELLS_SELECTOR = ":scope > div:not(.table-caption):first-of-type > div > *, :scope > div.table-caption:first-of-type + div > div > *";

function getSelectedIds(items: DIDLItem[], rowStates: RowState[]): string[] {
    if (items.length !== rowStates.length) {
        throw new Error("Both arrays must be same size");
    }

    const ids = [];
    for (let i = 0; i < items.length; i++)
        if ((rowStates[i] & RowState.SelectMask) === RowState.SelectMask)
            ids.push(items[i].id);
    return ids;
}

type ModeFlags = "multiSelect" | "useCheckboxes" | "modalDialogMode" | "useLevelUpRow";

type DisplayMode = "table" | "list" | "responsive";

type NavigationMode = "single-tap" | "double-click" | "auto";

export type CellTemplateProps<TContext> = HTMLAttributes<HTMLDivElement> & {
    data: DIDLItem;
    index: number;
    rowState: RowState;
    context?: TContext;
};

type RowStateProvider = ((item: DIDLItem, index: number) => RowState) | (RowState[]);

export type BrowserProps<TContext> = {
    rowStateProvider?: RowStateProvider;
    open?: (index: number) => boolean;
    selectionChanged?: (ids: string[]) => boolean | undefined | void;
    mainCellTemplate?: ComponentType<CellTemplateProps<TContext>>;
    mainCellContext?: TContext;
    displayMode?: DisplayMode;
    navigationMode?: NavigationMode;
    editMode?: boolean;
    nodeRef?: RefObject<HTMLDivElement>;
} & { [K in ModeFlags]?: boolean }

export type BrowserViewProps<TContext> = BrowserProps<TContext> & HTMLAttributes<HTMLDivElement> & NavigatorProps & DataFetchProps<BrowseFetchResult>;

type BrowserViewState = {
    ctx?: DataContext<BrowseFetchResult>;
    rsp?: RowStateProvider;
    states: RowState[];
    callback: (focused: number | null) => void;
    adapter: SelectionStateAdapter;
};

export default class BrowserView<TContext = unknown> extends React.Component<BrowserViewProps<TContext>, BrowserViewState> {

    private tableRef = React.createRef<HTMLDivElement>();
    private resizeObserver;

    static defaultProps: BrowserProps<unknown> = {
        displayMode: "responsive",
        navigationMode: "auto",
        editMode: false,
        multiSelect: true,
        useCheckboxes: false,
        useLevelUpRow: true,
        mainCellTemplate: CellTemplate
    };

    constructor(props: BrowserViewProps<TContext>) {
        super(props);
        this.resizeObserver = new ResizeObserver(this.resizeObservedHandler);
        this.state = {
            states: [], callback: this.selectionStateChanged,
            adapter: new SelectionStateAdapter([], null, this.selectionStateChanged)
        };
    }

    static getDerivedStateFromProps({ dataContext: pctx, rowStateProvider: prsp }: BrowserViewProps<unknown>,
        { ctx: sctx, callback, rsp: srsp }: BrowserViewState): Partial<BrowserViewState> | null {
        if (pctx && (pctx !== sctx || prsp !== srsp)) {
            const states = (typeof prsp === "function" ? pctx?.source.items?.map(prsp) : prsp) ?? [];
            return { ctx: pctx, rsp: prsp, states, adapter: new SelectionStateAdapter(states, null, callback) }
        }
        else
            return null;
    }

    componentDidUpdate({ dataContext: prevDataContext, displayMode: prevDisplayMode }: BrowserViewProps<TContext>) {
        const { dataContext, selectionChanged, displayMode } = this.props;

        if (dataContext && selectionChanged && prevDataContext !== dataContext) {
            selectionChanged([]);
        }

        if (prevDisplayMode !== displayMode) {
            MediaQueries.largeScreen.removeEventListener("change", this.screenQueryChangedHandler);
            if (this.props.displayMode === "responsive") {
                MediaQueries.largeScreen.addEventListener("change", this.screenQueryChangedHandler);
            }
        }
    }

    componentDidMount() {
        document.body.addEventListener("keydown", this.onKeyDown);
        if (this.props.displayMode === "responsive") {
            MediaQueries.largeScreen.addEventListener("change", this.screenQueryChangedHandler);
        }
        this.resizeObserver.disconnect();
        this.resizeObserver.observe(this.tableRef.current as HTMLDivElement);
    }

    componentWillUnmount() {
        MediaQueries.largeScreen.removeEventListener("change", this.screenQueryChangedHandler);
        document.body.removeEventListener("keydown", this.onKeyDown);
        this.resizeObserver.disconnect();
    }

    screenQueryChangedHandler = () => {
        this.forceUpdate();
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
        const headers = table.querySelectorAll<HTMLElement>(HEADER_CELLS_SELECTOR);
        headers.forEach(cell => { cell.style.top = top; });
    }

    onCheckboxChanged: ChangeEventHandler<HTMLInputElement> = e => {
        e.stopPropagation();
        const checkbox = e.target;
        const index = checkbox.parentElement?.parentElement?.dataset?.index;
        if (!index) return;
        this.state.adapter.set(parseInt(index), checkbox.checked);
    };

    onCheckboxAllChanged: ChangeEventHandler<HTMLInputElement> = e => {
        const checkbox = e.target;
        this.state.adapter.setAll(checkbox.checked);
    };

    private mouseEventHandler = (e: MouseEvent<HTMLDivElement>) => {

        const target = e.target as HTMLElement;

        if (target === e.currentTarget && e.type === "mousedown") {
            requestAnimationFrame(() => this.state.adapter.setAll(false));
            return;
        }

        if (target instanceof HTMLInputElement || target instanceof HTMLLabelElement || target.closest("button")) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }

        const row = target.closest<HTMLElement>(DATA_ROW_SELECTOR);
        if (!row?.dataset.index) return;
        const index = parseInt(row?.dataset.index);

        e.preventDefault();
        e.stopPropagation();

        switch (e.type) {
            case "mousedown":
                if ((e.ctrlKey || e.metaKey) && this.props.multiSelect)
                    requestAnimationFrame(() => this.state.adapter.toggle(index));
                else if (e.shiftKey && this.props.multiSelect)
                    requestAnimationFrame(() => this.state.adapter.expandTo(index));
                else
                    requestAnimationFrame(() => this.editMode
                        ? this.state.adapter.toggle(index)
                        : this.state.adapter.setOnly(index));
                break;
            case "mouseup":
                if (!this.dblClickNavMode && !this.editMode) {
                    requestAnimationFrame(() => this.navigateTo(index));
                }
                break;
            case "dblclick":
                if (this.dblClickNavMode && !this.editMode) {
                    requestAnimationFrame(() => this.navigateTo(index));
                }
                break;
        }
    }

    private onKeyDown = (event: KeyboardEvent) => {
        if (!this.state.adapter.enabled() || (!this.props.modalDialogMode && document.body.classList.contains("modal-open"))) return;

        switch (event.code) {
            case "Enter":
            case "ArrowRight":
                const focusedRow = this.tableRef.current?.querySelector<HTMLDivElement>(DATA_ROW_FOCUSED_SELECTOR);

                if (!focusedRow) {
                    if (event.code === "ArrowRight")
                        requestAnimationFrame(() => this.state.adapter.selectFirst());
                    return;
                }

                if (event.code === "Enter" && event.target !== focusedRow) return;

                const items = this.props.dataContext?.source.items;
                if (!items) return;
                const index = parseInt(focusedRow.dataset.index ?? "");
                const item = items[index];
                if (!item) return;
                const state = this.state.states[index];
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
                    event.preventDefault();
                    requestAnimationFrame(() => this.state.adapter.setAll(true));
                }
                break;
            case "ArrowUp":
                event.preventDefault();
                if (event.shiftKey && this.props.multiSelect)
                    requestAnimationFrame(() => this.state.adapter.expandUp());
                else
                    requestAnimationFrame(() => this.state.adapter.movePrev());
                break;
            case "ArrowDown":
                event.preventDefault();
                if (event.shiftKey && this.props.multiSelect)
                    requestAnimationFrame(() => this.state.adapter.expandDown());
                else
                    requestAnimationFrame(() => this.state.adapter.moveNext());
                break;
            default: return;
        }
    }

    private focusHandler = (event: FocusEvent<HTMLDivElement>) => {
        const row = event.target.matches(DATA_ROW_SELECTOR) && event.target as HTMLDivElement;
        if (row) {
            if (!row.dataset.index) return;
            const index = parseInt(row.dataset.index);
            if (index >= 0 && index !== this.state.adapter.focus) {
                // last tracked focused item id doesn't match currently focused row -
                // thus we came here as a result of focus switch via keyboard Tab or Shift+Tab
                // which we don't emulate programmatically. So lets synchronize selection with news focus
                requestAnimationFrame(() => this.state.adapter.setOnly(index));
            }
        }
    }

    private selectionStateChanged = (focused: number | null) => {
        if (focused != null) {
            const row = this.tableRef.current?.querySelector<HTMLDivElement>(`div[data-index="${focused}"]`);
            if (!row) return;

            if (row !== document.activeElement) {
                row.focus();
            }
        }
        else {
            const element = this.tableRef.current?.querySelector<HTMLDivElement>(DATA_ROW_FOCUSED_SELECTOR);
            element?.blur();
        }

        const { selectionChanged, dataContext: ctx } = this.props;

        if (!ctx?.source.items) return;

        const { source: { items } } = ctx;

        if (selectionChanged?.(getSelectedIds(items, this.state.states)) !== false) {
            this.forceUpdate();
        }
    }

    private navigateTo = (index: number) => {
        if (index === -1) {
            this.props.navigate?.({ id: this.props.dataContext?.source.parents?.[1]?.id ?? "-1" });
        }
        else {
            const item = this.props.dataContext?.source.items?.[index];
            if (!item) return;
            if (item.container && this.state.states[index] & RowState.Navigable)
                this.props.navigate?.({ id: item.id });
            else
                this.props.open?.(index);
        }
    }

    private get editMode() {
        return this.props.editMode;
    }

    private get dblClickNavMode() {
        return this.props.navigationMode === "double-click" || this.props.navigationMode === "auto" && MediaQueries.pointerDevice.matches;
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
            useCheckboxes, useLevelUpRow, displayMode, style, nodeRef } = this.props;

        const { source: { items = [], parents = [] } = {} } = this.props.dataContext || {};

        const children = React.Children.toArray(this.props.children);
        const caption = children.find(c => (c as ReactElement)?.type === BrowserView.Caption);
        const footer = children.find(c => (c as ReactElement)?.type === BrowserView.Footer);
        const contextMenu = children.find(c => (c as ReactElement)?.type === BrowserView.ContextMenu);

        const tableMode = displayMode === "table" || displayMode === "responsive" && MediaQueries.largeScreen.matches;
        const optimizeForTouch = MediaQueries.touchDevice.matches;

        return <div ref={nodeRef} className={`d-flex flex-column pb-3${className ? ` ${className}` : ""}`} style={style}
            onMouseDown={this.mouseEventHandler} onMouseUp={this.mouseEventHandler} onDoubleClick={this.mouseEventHandler}>
            <div className={`auto-table at-material user-select-none${optimizeForTouch ? " at-touch-friendly" : ""}`}
                ref={this.tableRef} onFocus={this.focusHandler}>
                {caption}
                <div className={tableMode ? "sticky-header" : "d-none"}>
                    <div>
                        {useCheckboxes &&
                            <label className="cb-wrap">
                                <input type="checkbox" onChange={this.onCheckboxAllChanged}
                                    checked={this.state.adapter.allSelected()} disabled={!this.state.adapter.enabled()} />
                            </label>}
                        <div className="w-100">Name</div>
                        <div>Size</div>
                        <div>Time</div>
                        <div>Kind</div>
                    </div>
                </div>
                <div>
                    {tableMode && useLevelUpRow && parents && parents.length > 0 &&
                        <div data-index={-1} title="Go to parent folder (you may use Backspace or LeftArrow keyboard key as well) ...">
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
                        const selected = !!(this.state.states[index] & RowState.Selected);
                        const selectable = !!(this.state.states[index] & RowState.Selectable);
                        const active = this.state.states[index] & RowState.Active ? true : undefined;
                        return <div key={e.id} tabIndex={0} data-index={index} data-selected={(selected && selectable) ? true : undefined} data-active={active}>
                            {useCheckboxes && <label className="cb-wrap">
                                <input type="checkbox" onChange={this.onCheckboxChanged} checked={selected && selectable} disabled={!selectable} />
                            </label>}
                            <div className="mw-1 w-100"><MainCellTemplate data={e} index={index} context={mainCellContext} rowState={this.state.states[index]} /></div>
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