import React, { ChangeEventHandler, ComponentType, FocusEvent, HTMLAttributes, MouseEvent, ReactNode, RefObject } from "react";
import { DataFetchProps } from "../../components/DataFetch";
import { HotKey } from "../../components/HotKey";
import { MediaQueries } from "../../components/MediaQueries";
import { NavigatorProps } from "../../components/Navigator";
import AlbumArt from "./AlbumArt";
import { DIDLTools as utils } from "./DIDLTools";
import RowStateContext from "./RowStateContext";
import { BrowseFetchResult, DIDLItem, RowState } from "./Types";

const DATA_ROW_SELECTOR = "div[data-index]";
const DATA_ROW_FOCUSED_SELECTOR = "div[data-index]:focus";
const CAPTION_SELECTOR = ":scope > div.table-caption";
const HEADER_GROUP_SELECTOR = ":scope > div.table-header";

type ModeFlags = "multiSelect" | "useCheckboxes" | "modalDialogMode" | "useLevelUpRow" | "stickyCaption" | "stickyHeaders";

type DisplayMode = "table" | "list" | "responsive";

type NavigationMode = "single-tap" | "double-click" | "auto";

export type CellTemplateProps<TContext> = HTMLAttributes<HTMLDivElement> & {
    data: DIDLItem;
    index: number;
    rowState: RowState;
    context?: TContext;
};

type RenderFunc = () => ReactNode;

export type BrowserProps<TContext> = {
    openHandler?: (item: DIDLItem, index: number) => boolean;
    hotKeyHandler?: (selection: DIDLItem[], focused: DIDLItem | undefined, hotKey: HotKey) => boolean | void;
    mainCellTemplate?: ComponentType<CellTemplateProps<TContext>>;
    mainCellContext?: TContext;
    displayMode?: DisplayMode;
    navigationMode?: NavigationMode;
    editMode?: boolean;
    nodeRef?: RefObject<HTMLDivElement>;
    renderCaption?: RenderFunc;
    renderFooter?: RenderFunc;
} & { [K in ModeFlags]?: boolean }

export type BrowserViewProps<TContext> = BrowserProps<TContext> & HTMLAttributes<HTMLDivElement> & NavigatorProps & DataFetchProps<BrowseFetchResult>;

export default class BrowserView<TContext = unknown> extends React.Component<BrowserViewProps<TContext>> {

    static contextType = RowStateContext;
    declare context: React.ContextType<typeof RowStateContext>;
    private tableRef = React.createRef<HTMLDivElement>();
    private resizeObserver;

    static defaultProps: BrowserProps<unknown> = {
        displayMode: "responsive",
        navigationMode: "auto",
        editMode: false,
        multiSelect: true,
        useCheckboxes: false,
        useLevelUpRow: false,
        stickyCaption: true,
        stickyHeaders: true,
        mainCellTemplate: CellTemplate
    }

    constructor(props: BrowserViewProps<TContext>) {
        super(props);
        this.resizeObserver = new ResizeObserver(this.updateStickyElementsLayout);
    }

    componentDidUpdate({ displayMode: prevDisplayMode, useCheckboxes: prevUseCheckboxes }: BrowserViewProps<TContext>) {
        const { displayMode, useCheckboxes } = this.props;

        if (prevDisplayMode !== displayMode) {
            MediaQueries.largeScreen.removeEventListener("change", this.screenQueryChangedHandler);
            if (this.props.displayMode === "responsive") {
                MediaQueries.largeScreen.addEventListener("change", this.screenQueryChangedHandler);
            }
        }

        if (prevUseCheckboxes !== useCheckboxes) {
            this.updateStickyElementsLayout();
        }

        if (this.context.current !== undefined) {
            const row = this.tableRef.current?.querySelector<HTMLDivElement>(`div[data-index="${this.context.current}"]`);

            if (!row)
                return;

            if (row !== document.activeElement)
                row.focus();
        }
        else {
            const element = this.tableRef.current?.querySelector<HTMLDivElement>(DATA_ROW_FOCUSED_SELECTOR);
            element?.blur();
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

    updateStickyElementsLayout = () => {
        const table = this.tableRef.current;
        if (!table) return;

        let offset = table.offsetTop;

        if (this.props.stickyCaption) {
            const caption = table.querySelector<HTMLDivElement>(CAPTION_SELECTOR);
            if (caption) {
                const rect = caption.getBoundingClientRect();
                caption.style.top = `${Math.round(offset)}px`;
                offset += rect.height;
            }
        }

        if (this.props.stickyHeaders) {
            const top = `${Math.round(offset)}px`;
            const header = table.querySelector<HTMLElement>(HEADER_GROUP_SELECTOR);
            if (header) {
                header.style.top = top;
            }
        }
    }

    onCheckboxChanged: ChangeEventHandler<HTMLInputElement> = e => {
        e.stopPropagation();
        const checkbox = e.target;
        const index = checkbox.parentElement?.parentElement?.dataset?.index;
        if (!index) return;
        this.context.dispatch({ type: "SET", index: parseInt(index), selected: checkbox.checked });
    };

    onCheckboxAllChanged: ChangeEventHandler<HTMLInputElement> = e => {
        const checkbox = e.target;
        this.context.dispatch({ type: "SET_ALL", selected: checkbox.checked });
    };

    private mouseEventHandler = (e: MouseEvent<HTMLDivElement>) => {

        const target = e.target as HTMLElement;

        if (target === e.currentTarget && e.type === "mousedown") {
            this.context.dispatch({ type: "SET_ALL", selected: false });
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
                    this.context.dispatch({ type: "TOGGLE", index });
                else if (e.shiftKey && this.props.multiSelect)
                    this.context.dispatch({ type: "EXPAND_TO", index });
                else if (this.editMode)
                    this.context.dispatch({ type: "TOGGLE", index })
                else
                    this.context.dispatch({ type: "SET_ONLY", index });
                break;
            case "mouseup":
                if (!this.dblClickNavMode && !this.editMode)
                    this.navigateTo(index);
                break;
            case "dblclick":
                if (this.dblClickNavMode && !this.editMode)
                    this.navigateTo(index);
                break;
        }
    }

    private onKeyDown = (event: KeyboardEvent) => {
        if (!this.context.enabled || (!this.props.modalDialogMode && document.body.classList.contains("modal-open"))) return;

        switch (event.code) {
            case "Enter":
            case "ArrowRight":
                const focusedRow = this.tableRef.current?.querySelector<HTMLDivElement>(DATA_ROW_FOCUSED_SELECTOR);

                if (!focusedRow) {
                    if (event.code === "ArrowRight")
                        this.context.dispatch({ type: "SET_ONLY", index: 0 });
                    return;
                }

                if (event.code === "Enter" && event.target !== focusedRow) return;

                const items = this.props.dataContext?.source.items;
                if (!items) return;
                const index = parseInt(focusedRow.dataset.index ?? "");
                const item = items[index];
                if (!item) return;

                const state = this.context.get(index);
                if (item.container && state & RowState.Navigable)
                    this.props.navigate?.(`../${item.id}`);
                else if (state ^ RowState.Readonly && event.code === "Enter" && this.props.openHandler) {
                    const item = this.props.dataContext?.source.items?.[index];
                    if (item) this.props.openHandler(item, index);
                }

                break;
            case "Backspace":
            case "ArrowLeft":
                const parents = this.props.dataContext?.source.parents;
                this.props.navigate?.(`../${parents?.[1]?.id ?? "-1"}`);
                break;
            case "KeyA":
                if (this.props.multiSelect && !event.cancelBubble && (event.metaKey || event.ctrlKey)) {
                    event.preventDefault();
                    this.context.dispatch({ type: "SET_ALL", selected: true });
                }
                break;
            case "ArrowUp":
                event.preventDefault();
                if (event.shiftKey && this.props.multiSelect)
                    this.context.dispatch({ type: "EXPAND_UP" });
                else
                    this.context.dispatch({ type: "PREV" });
                break;
            case "ArrowDown":
                event.preventDefault();
                if (event.shiftKey && this.props.multiSelect)
                    this.context.dispatch({ type: "EXPAND_DOWN" });
                else
                    this.context.dispatch({ type: "NEXT" });
                break;
            default: return;
        }
    }

    private captureHotKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
        const handler = this.props.hotKeyHandler;
        if (!handler) return;
        const { code, altKey, shiftKey, ctrlKey, metaKey } = event;
        const hotKey = new HotKey(code, altKey, ctrlKey, shiftKey, metaKey);
        if (handler(this.context.selection, this.props.dataContext?.source.items?.[this.context.current ?? 0], hotKey) == false) {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    private focusHandler = (event: FocusEvent<HTMLDivElement>) => {
        const row = event.target.matches(DATA_ROW_SELECTOR) && event.target as HTMLDivElement;
        if (row) {
            if (!row.dataset.index) return;
            const index = parseInt(row.dataset.index);
            if (index >= 0 && index !== this.context.current) {
                // last tracked focused item id doesn't match currently focused row -
                // thus we came here as a result of focus switch via keyboard Tab or Shift+Tab
                // which we don't emulate programmatically. So lets synchronize selection with news focus
                this.context.dispatch({ type: "SET_ONLY", index });
            }
        }
    }

    private navigateTo = (index: number) => {
        if (index === -1) {
            this.props.navigate?.(`../${this.props.dataContext?.source.parents?.[1]?.id ?? "-1"}`);
        }
        else {
            const item = this.props.dataContext?.source.items?.[index];
            if (!item) return;
            if (item.container && this.context.get(index) & RowState.Navigable)
                this.props.navigate?.(`../${item.id}`);
            else if (this.props.openHandler) {
                const item = this.props.dataContext?.source.items?.[index];
                if (item) this.props.openHandler(item, index);
            }
        }
    }

    private get editMode() {
        return this.props.editMode;
    }

    private get dblClickNavMode() {
        return this.props.navigationMode === "double-click" || this.props.navigationMode === "auto" && MediaQueries.pointerDevice.matches;
    }

    render() {

        const { className, mainCellTemplate: MainCellTemplate = CellTemplate, mainCellContext,
            useCheckboxes, useLevelUpRow, stickyCaption, stickyHeaders, displayMode, style, nodeRef,
            renderCaption, renderFooter, children } = this.props;

        const { source: { items = [], parents = [] } = {} } = this.props.dataContext || {};

        const tableMode = displayMode === "table" || displayMode === "responsive" && MediaQueries.largeScreen.matches;
        const optimizeForTouch = MediaQueries.touchDevice.matches;
        const headerClass = tableMode ? (stickyHeaders ? "sticky-top" : "") : "d-none";

        return <div ref={nodeRef} className={`vstack pb-3 position-relative overflow-auto${className ? ` ${className}` : ""}`} style={style}
            onMouseDown={this.mouseEventHandler} onMouseUp={this.mouseEventHandler} onDoubleClick={this.mouseEventHandler}>
            <div className={`table table-material user-select-none${optimizeForTouch ? " table-touch-friendly" : ""}`}
                ref={this.tableRef} onFocus={this.focusHandler}>
                {renderCaption && <div className={`table-caption bg-body${stickyCaption ? " sticky-top" : ""}`}>{renderCaption()}</div>}
                <div className={`table-header${headerClass ? ` ${headerClass}` : ""}`}>
                    <div className="bg-body">
                        {useCheckboxes &&
                            <label className="lh-1">
                                <input type="checkbox" onChange={this.onCheckboxAllChanged}
                                    checked={this.context.allSelected && items.length > 0} disabled={!this.context.enabled || items.length === 0} />
                            </label>}
                        <div className="w-100">Name</div>
                        <div>Size</div>
                        <div>Time</div>
                        <div>Kind</div>
                    </div>
                </div>
                <div className="table-body" onKeyDown={this.captureHotKey}>
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
                        const state = this.context.get(index);
                        const selected = !!(state & RowState.Selected);
                        const selectable = !!(state & RowState.Selectable);
                        const active = !!(state & RowState.Active);
                        return <div key={e.id} tabIndex={0} data-index={index} data-selected={(selected && selectable) ? true : undefined} data-active={active}>
                            {useCheckboxes && <label className="lh-1">
                                <input type="checkbox" onChange={this.onCheckboxChanged} checked={selected && selectable} disabled={!selectable} />
                            </label>}
                            <div className="mw-1 w-100"><MainCellTemplate data={e} index={index} context={mainCellContext} rowState={this.context.get(index)} /></div>
                            {tableMode && <>
                                <div className="small text-end">{utils.formatSize(e.res?.size)}</div>
                                <div className="small">{utils.formatTime(e.res?.duration)}</div>
                                <div className="text-capitalize">{utils.getDisplayName(e.class)}</div>
                            </>}
                        </div>;
                    })]}
                </div>
                {renderFooter && <div className="table-footer">{renderFooter()}</div>}
            </div>
            {children}
        </div>
    }
}

export function CellTemplate({ children, data, index, rowState, context, ...other }: CellTemplateProps<unknown>) {
    const { class: itemClass, albumArts, title, creator, album, res } = data;
    return <div className="hstack" title={utils.formatMediaInfo(res) ?? undefined} {...other}>
        <AlbumArt itemClass={itemClass} albumArts={albumArts} className="me-2 rounded-1" />
        <span className="text-truncate flex-grow-1">
            {title}
            {creator && <>&nbsp;&bull;&nbsp;<small>{creator}</small></>}
            {album && <>&nbsp;&bull;&nbsp;<small>{album}</small></>}
        </span>
        {children}
    </div>;
}