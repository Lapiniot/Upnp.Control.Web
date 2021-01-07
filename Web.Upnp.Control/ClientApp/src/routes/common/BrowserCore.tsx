import React, { ChangeEventHandler, ComponentType, HTMLAttributes, MouseEventHandler, ReactElement, MouseEvent } from "react";
import AlbumArt from "./AlbumArt";
import SelectionService from "../../components/SelectionService";
import { DIDLUtils as utils } from "./BrowserUtils";
import { BrowseFetchResult, DIDLItem } from "./Types";
import { NavigatorProps } from "./Navigator";
import { DataFetchProps } from "../../components/DataFetch";
import { DropdownMenu, DropdownMenuProps } from "../../components/DropdownMenu";

type ModeFlags = "multiSelect" | "runsInDialog" | "useCheckboxes" | "selectOnClick" | "stickyColumnHeaders";

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
    rowState?: (item: DIDLItem, index: number) => RowState;
    open?: (id: string) => boolean;
    selection?: SelectionService;
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
    private selectables: string[] = [];
    private focusedItem: string | null = null;

    constructor(props: PropsType<P>) {
        super(props);
        this.selection = props.selection || new SelectionService();
        this.resizeObserver = new ResizeObserver(this.onCaptionResized);
    }

    componentDidUpdate(prevProps: PropsType<P>) {
        if (prevProps.selection !== this.props.selection) {
            this.selection = this.props.selection || new SelectionService();
        }
        if (prevProps.dataContext?.source !== this.props.dataContext?.source) {
            this.focusedItem = null;
        }
    }

    componentDidMount() {
        document.addEventListener("keydown", this.onKeyDown, this.props.runsInDialog === true);

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

    componentWillUnmount() {
        document.removeEventListener("keydown", this.onKeyDown);
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
        const cancelled = !this.selection.select(id, checkbox.checked);
        this.notifySelectionChanged(cancelled);
    };

    onCheckboxAllChanged: ChangeEventHandler<HTMLInputElement> = e => {
        const checkbox = e.target;
        const cancelled = !this.selection.selectMany(this.selectables ?? [], checkbox.checked);
        this.notifySelectionChanged(cancelled);
    };

    onContainerMouseDown: MouseEventHandler<HTMLElement> = e => {

        const target = e.target as HTMLElement;

        if (target === e.currentTarget && this.selection.any()) {
            this.toggleSelectionAll(false);
        } else {
            if (target instanceof HTMLInputElement || target.closest("button")) return;

            const row = target.closest<HTMLElement>("div[data-selectable=\"1\"]");
            if (!row) return;

            const id = row.dataset.id;

            if (!id || !this.selectables) return;

            e.stopPropagation();

            const multiSelect = this.props.multiSelect;

            if (multiSelect && (e.ctrlKey || e.metaKey)) {
                this.focusedItem = id;
                // selective multi-selection
                this.toggleSelection(id);
            }
            else if (multiSelect && e.shiftKey) {
                e.preventDefault();
                // range multi-selection
                const selectionStart = Math.max(this.selectables.indexOf(this.focusedItem ?? ""), 0);
                const selectionEnd = this.selectables.indexOf(id);
                this.focusedItem = id;
                this.selectRange(selectionStart, selectionEnd);
            }
            else // single item selection
            {
                if (this.selection.one() && this.selection.selected(id)) return;

                this.focusedItem = id;
                this.selection.reset();
                const cancelled = !this.selection.select(id, true);
                this.notifySelectionChanged(cancelled);
            }
        }
    }

    onKeyDown = (event: KeyboardEvent) => {

        if (!this.selectables?.length) return;

        switch (event.code) {
            case "Enter":
            case "ArrowRight":
                if (!this.focusedItem) {
                    if (event.code === "ArrowRight")
                        this.selectItem(0, event, false);
                    return;
                }

                const items = this.props.dataContext?.source.items;
                if (!items?.length) return;
                const index = items.findIndex(i => i.id === this.focusedItem);
                const item = items[index];
                if (!item) return;
                const state = this.props.rowState?.(item, index) ?? RowState.Navigable;

                if (item.container && state & RowState.Navigable)
                    this.props.navigate?.({ id: this.focusedItem });
                else if (state ^ RowState.Readonly && event.code === "Enter")
                    this.props.open?.(this.focusedItem);
                break;
            case "Backspace":
            case "ArrowLeft":
                const parents = this.props.dataContext?.source.parents;
                this.props.navigate?.({ id: parents?.[1].id ?? "-1" });
                break;
            case "KeyA":
                if (this.props.multiSelect && !event.cancelBubble && (event.metaKey || event.ctrlKey)) {
                    event.preventDefault();
                    event.stopPropagation();
                    this.toggleSelectionAll(true);
                }
                break;
            case "ArrowUp":
                if (this.focusedItem) {
                    const current = this.selectables.indexOf(this.focusedItem);
                    if (current > 0) {
                        this.selectItem(current - 1, event, false);
                    }
                }
                else {
                    this.selectItem(0, event, false);
                }
                break;
            case "ArrowDown":
                if (this.focusedItem) {
                    const current = this.selectables.indexOf(this.focusedItem);
                    if (current < this.selectables.length - 1) {
                        this.selectItem(current + 1, event, false);
                    }
                }
                else {
                    this.selectItem(0, event, false);
                }
                break;
        }
    }

    private selectItem = (index: number, event: KeyboardEvent, toggle: boolean) => {
        event.preventDefault();
        event.stopPropagation();
        this.focusedItem = this.selectables[index];
        if (!toggle) this.selection.reset();
        this.notifySelectionChanged(!this.selection.select(this.focusedItem, !toggle || !this.selection.selected(this.focusedItem)));
        const row = this.tableRef.current?.querySelector<HTMLDivElement>(`div[data-id='${this.focusedItem}']`);
        row?.scrollIntoView({ block: "center", behavior: "smooth" });
    }

    private notifySelectionChanged = (cancelled: boolean) => {
        if (!cancelled) this.setState({ selection: true });
    }

    private selectRange(selectionStart: number, selectionEnd: number) {
        const range = this.selectables?.slice(Math.min(selectionStart, selectionEnd), Math.max(selectionStart, selectionEnd) + 1);
        this.selection.reset();
        const cancelled = !this.selection.selectMany(range ?? [], true);
        this.notifySelectionChanged(cancelled);
    }

    private toggleSelection(id: string) {
        const cancelled = !this.selection.select(id, !this.selection.selected(id));
        this.notifySelectionChanged(cancelled);
    }

    private toggleSelectionAll(state: boolean) {
        this.focusedItem = null;
        const cancelled = state ?
            !this.selection.selectMany(this.selectables ?? [], state) :
            !this.selection.clear();
        this.notifySelectionChanged(cancelled);
    }

    navigateHandler = ({ currentTarget: { dataset } }: MouseEvent<HTMLDivElement>) => {
        this.props.navigate(dataset);
    }

    open: MouseEventHandler<HTMLDivElement> = ({ currentTarget: { dataset: { selectable, id } } }) =>
        this.props.open ? selectable && this.props.open(id as string) : undefined;

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
        const states = items.map(rowState);
        this.selectables = items.filter((_, i) => states[i] & RowState.Selectable).map(i => i.id);
        const children = React.Children.toArray(this.props.children);
        const header = children.find(c => (c as ReactElement)?.type === MediaBrowser.Header);
        const footer = children.find(c => (c as ReactElement)?.type === MediaBrowser.Footer);
        const contextMenu = children.find(c => (c as ReactElement)?.type === MediaBrowser.ContextMenu);
        return <div className={`d-flex flex-grow-1 flex-column${className ? ` ${className}` : ""}`} onClick={selectOnClick ? this.onContainerMouseDown : undefined}>
            <div className="auto-table table-compact table-hover-link table-striped w-100 mw-100" ref={this.tableRef}>
                {header}
                <div className={stickyColumnHeaders ? "sticky-header" : undefined}>
                    <div>
                        {useCheckboxes &&
                            <div>
                                <input type="checkbox" id="select_all" onChange={this.onCheckboxAllChanged}
                                    checked={this.selection.all(this.selectables)} disabled={this.selectables.length === 0} />
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
                        const selectable = !!(states[index] & RowState.Selectable);
                        return <div key={e.id} data-id={e.id} data-selectable={selectOnClick && selectable ? 1 : undefined}
                            data-selected={selected} data-active={!!(states[index] & RowState.Active)}
                            onDoubleClick={e.container && (states[index] & RowState.Navigable) ? this.navigateHandler : this.open}>
                            {useCheckboxes && <div>
                                <input type="checkbox" onChange={this.onCheckboxChanged} checked={selected} disabled={!selectable} />
                            </div>}
                            <div className="mw-1"><MainCellTemplate data={e} index={index} context={mainCellContext} rowState={states[index]} /></div>
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