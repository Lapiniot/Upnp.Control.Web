import { ChangeEventHandler, Component, ComponentType, createRef, FocusEvent, HTMLAttributes, PointerEvent, ReactNode, RefObject, UIEvent } from "react";
import { DataFetchProps } from "../../hooks/DataFetch";
import { HotKey } from "../../services/HotKey";
import AlbumArt from "./AlbumArt";
import { formatMediaInfo, formatSize, formatTime, getDisplayName } from "./DIDLTools";
import RowStateContext, { RowState } from "./RowStateContext";

const DATA_ROW_SELECTOR = "div[data-index]";
const DATA_ROW_FOCUSED_SELECTOR = "div[data-index]:focus";
const CAPTION_SELECTOR = ":scope > div.table-caption";
const HEADER_GROUP_SELECTOR = ":scope > div.table-header";

type ModeFlags = "multiSelect" | "useCheckboxes" | "useLevelUpRow" | "stickyCaption" | "stickyHeaders";

type DisplayMode = "table" | "list";

type NavigationMode = "tap" | "dbl-click";

interface ExtensionCallbacks {
    navigate(to: string): void;
    hotKeyHandler?(selection: Upnp.DIDL.Item[], focused: Upnp.DIDL.Item | undefined, hotKey: HotKey): boolean | void;
    openHandler?(item: Upnp.DIDL.Item, index: number): void;
}

export type CellTemplateProps<TContext> = HTMLAttributes<HTMLDivElement> & {
    data: Upnp.DIDL.Item;
    index: number;
    rowState: RowState;
    context?: TContext;
};

export type BrowserProps<TContext> = {
    mainCellTemplate?: ComponentType<CellTemplateProps<TContext>>,
    mainCellContext?: TContext,
    displayMode?: DisplayMode,
    navigationMode?: NavigationMode,
    editMode?: boolean,
    nodeRef?: RefObject<HTMLDivElement>,
    renderCaption?(): ReactNode,
    renderFooter?(): ReactNode
} & { [K in ModeFlags]?: boolean }

export type BrowserViewProps<TContext> = HTMLAttributes<HTMLDivElement>
    & BrowserProps<TContext>
    & DataFetchProps<Upnp.BrowseFetchResult>
    & ExtensionCallbacks

export default class BrowserView<TContext = unknown> extends Component<BrowserViewProps<TContext>> {

    static contextType = RowStateContext;
    override context: React.ContextType<typeof RowStateContext>;
    private ref;
    private dialogMode = false;

    static defaultProps: BrowserProps<unknown> = {
        displayMode: "table",
        navigationMode: "dbl-click",
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
        this.ref = createRef<HTMLDivElement>();
        this.context = {
            enabled: false, current: undefined, selection: [],
            allSelected: false, dispatch: () => { }, get: () => RowState.None,
        }
    }

    componentDidUpdate() {
        if (this.context.current !== undefined) {
            const row = this.ref.current?.querySelector<HTMLDivElement>(`div[data-index="${this.context.current}"]`);

            if (!row)
                return;

            if (row !== document.activeElement)
                row.focus();
        }
        else {
            const element = this.ref.current?.querySelector<HTMLDivElement>(DATA_ROW_FOCUSED_SELECTOR);
            element?.blur();
        }
    }

    componentDidMount() {
        this.dialogMode = this.ref.current?.closest("dialog") !== null;
        document.addEventListener("keydown", this.keydownListener);
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.keydownListener);
    }

    screenQueryChangedHandler = () => {
        this.forceUpdate();
    }

    onCheckboxChanged: ChangeEventHandler<HTMLInputElement> = e => {
        const checkbox = e.target;
        const index = checkbox.parentElement?.parentElement?.dataset?.index;
        if (!index) return;
        this.context.dispatch({ type: "SET", index: parseInt(index), selected: checkbox.checked });
    };

    onCheckboxAllChanged: ChangeEventHandler<HTMLInputElement> = e => {
        const checkbox = e.target;
        this.context.dispatch({ type: "SET_ALL", selected: checkbox.checked });
    };

    private pointerDownHandler = (event: PointerEvent) => {
        const element = event.target as HTMLElement;

        if (event.defaultPrevented || isInteractive(element)) return;

        if (element === event.currentTarget) {
            this.context.dispatch({ type: "SET_ALL", selected: false });
            return;
        }

        if (event.pointerType === "touch") {
            return;
        }

        const index = getDataIndex(element);
        if (index === undefined) return;

        if ((event.ctrlKey || event.metaKey) && this.props.multiSelect)
            this.context.dispatch({ type: "TOGGLE", index });
        else if (event.shiftKey && this.props.multiSelect)
            this.context.dispatch({ type: "EXPAND_TO", index });
        else if (this.props.editMode)
            this.context.dispatch({ type: "TOGGLE", index })
        else
            this.context.dispatch({ type: "SET_ONLY", index });
    }

    private navigateHandler = (event: UIEvent) => {
        if (event.defaultPrevented || isInteractive(event.target as HTMLElement)) return;
        const index = getDataIndex(event.target as HTMLElement);
        if (index === undefined) return;
        this.navigateTo(index);
    }

    private keydownListener = (event: KeyboardEvent) => {
        if (event.defaultPrevented || !this.context.enabled) return;

        if (document.body.dataset["modalOpen"] === "1" && !this.dialogMode) {
            // There is currently modal <dialog> element trapping focus and current component is not rendered "in-dialog" mode.
            // We should skip keyboard handler in order to imitate "inert" attribute behavior.
            return;
        }

        switch (event.code) {
            case "Enter":
            case "ArrowRight":
                const focusedRow = this.ref.current?.querySelector<HTMLDivElement>(DATA_ROW_FOCUSED_SELECTOR);

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
                    this.props.navigate(`../${item.id}`);
                else if (state ^ RowState.Readonly && event.code === "Enter" && this.props.openHandler) {
                    const item = this.props.dataContext?.source.items?.[index];
                    if (item) this.props.openHandler(item, index);
                }

                break;
            case "Backspace":
            case "ArrowLeft":
                const parents = this.props.dataContext?.source.parents;
                this.props.navigate(`../${parents?.[1]?.id ?? "-1"}`);
                break;
            case "KeyA":
                if (this.props.multiSelect && (event.metaKey || event.ctrlKey)) {
                    event.preventDefault();
                    this.context.dispatch({ type: "SET_ALL", selected: true });
                }
                break;
            case "Escape":
                if (this.props.multiSelect && this.context.selection.length > 1) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    this.context.dispatch({ type: "SET_ALL", selected: false });
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
            this.props.navigate(`../${this.props.dataContext?.source.parents?.[1]?.id ?? "-1"}`);
        }
        else {
            const item = this.props.dataContext?.source.items?.[index];
            if (!item) return;
            if (item.container && this.context.get(index) & RowState.Navigable)
                this.props.navigate(`../${item.id}`);
            else if (this.props.openHandler) {
                const item = this.props.dataContext?.source.items?.[index];
                if (item) this.props.openHandler(item, index);
            }
        }
    }

    render() {

        const { className, mainCellTemplate: MainCellTemplate = CellTemplate, mainCellContext,
            useCheckboxes, useLevelUpRow, stickyCaption, stickyHeaders, displayMode, navigationMode, editMode, style, nodeRef,
            renderCaption, renderFooter, children } = this.props;

        const { source: { items = [], parents = [] } = {} } = this.props.dataContext || {};

        const tableMode = displayMode === "table";
        const headerClass = tableMode ? (stickyHeaders ? "sticky-top" : "") : "d-none";

        return <div ref={nodeRef} className={`browser-view vstack position-relative overflow-auto${className ? ` ${className}` : ""}`} style={style}
            onPointerDown={this.pointerDownHandler}
            onPointerUp={navigationMode !== "dbl-click" && !editMode ? this.navigateHandler : undefined}
            onDoubleClick={navigationMode === "dbl-click" && !editMode ? this.navigateHandler : undefined}>
            <div className="table table-material user-select-none" ref={this.ref} onFocus={this.focusHandler}>
                {renderCaption && <div className={`table-caption${stickyCaption ? " sticky-top" : ""}`}>{renderCaption()}</div>}
                <div className={`table-header${headerClass ? ` ${headerClass}` : ""}`}>
                    <div>
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
                        return <div key={index} tabIndex={0} data-index={index} data-selected={(selected && selectable) ? true : undefined} data-active={active}>
                            {useCheckboxes && <label className="lh-1">
                                <input type="checkbox" onChange={this.onCheckboxChanged} checked={selected && selectable} disabled={!selectable} />
                            </label>}
                            <div className="mw-1 w-100"><MainCellTemplate data={e} index={index} context={mainCellContext} rowState={this.context.get(index)} /></div>
                            {tableMode && <>
                                <div className="small text-end">{formatSize(e.res?.size)}</div>
                                <div className="small">{formatTime(e.res?.duration)}</div>
                                <div className="text-capitalize">{getDisplayName(e.class)}</div>
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
    return <div className="hstack g-3" title={formatMediaInfo(res) ?? undefined} {...other}>
        <AlbumArt itemClass={itemClass} albumArts={albumArts} />
        <span className="text-truncate flex-grow-1">
            {title}
            {creator && <>&nbsp;&bull;&nbsp;<small>{creator}</small></>}
            {album && <>&nbsp;&bull;&nbsp;<small>{album}</small></>}
        </span>
        {children}
    </div>;
}

function getDataIndex(target: HTMLElement) {
    const row = target.closest<HTMLElement>(DATA_ROW_SELECTOR);
    if (!row?.dataset.index) return undefined;
    return parseInt(row.dataset.index);
}

function isInteractive(element: Element) {
    return element instanceof HTMLInputElement || element instanceof HTMLLabelElement || element.closest("button");
}