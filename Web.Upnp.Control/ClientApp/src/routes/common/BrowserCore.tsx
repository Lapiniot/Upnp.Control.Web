import React, { ChangeEventHandler, ElementType, HTMLAttributes, MouseEventHandler, PropsWithChildren, ReactElement } from "react";
//import Tooltip from "bootstrap/js/dist/tooltip";
import AlbumArt from "./AlbumArt";
import SelectionService from "../../components/SelectionService";
import { DIDLUtils as utils } from "./BrowserUtils";
import { BrowseFetchResult, DIDLItem } from "./Types";
import { NavigatorProps } from "./Navigator";
import { DataFetchProps } from "../../components/DataFetch";

type ModeFlags = "multiSelect" | "runsInDialog" | "useCheckboxes" | "selectOnClick" | "stickyColumnHeaders";

export type BrowserCoreProps = {
    selectionFilter?: (item: DIDLItem) => boolean;
    navigationFilter?: (item: DIDLItem) => boolean;
    open?: (id: string) => boolean;
    selection?: SelectionService;
    cellTemplate?: ElementType;
    cellContext?: any;
} & { [K in ModeFlags]?: boolean }

type MediaBrowserState = {}

type PropsType = BrowserCoreProps & HTMLAttributes<HTMLDivElement> & NavigatorProps & DataFetchProps<BrowseFetchResult>;

export default class MediaBrowser extends React.Component<PropsType, MediaBrowserState> {
    state = { modal: null };
    private selection;
    private tableRef = React.createRef<HTMLDivElement>();
    private resizeObserver;
    private selectables: string[] | null = null;
    private focusedItem: string | null = null;

    constructor(props: PropsType) {
        super(props);
        this.selection = props.selection || new SelectionService();
        this.resizeObserver = new ResizeObserver(this.onCaptionResized);
    }

    componentDidUpdate(prevProps: PropsType) {
        if (prevProps.selection !== this.props.selection) {
            this.selection = this.props.selection || new SelectionService();
        }

        /*const options = {
            delay: 1000, html: true, placement: "bottom",
            template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner text-start" style="hyphens: auto"></div></div>'
        };
        this.tableRef.current.querySelectorAll("[data-bs-toggle='tooltip']").forEach(e => new Tooltip(e, options));*/
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
                // selective multi-selection
                this.toggleSelection(id);
            }
            else if (multiSelect && e.shiftKey) {
                e.preventDefault();
                // range multi-selection
                const selectionStart = Math.max(this.selectables.indexOf(this.focusedItem ?? ""), 0);
                const selectionEnd = this.selectables.indexOf(id);
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

    onKeyDown: EventListener = e => {
        const ke = e as KeyboardEvent;
        if (this.props.multiSelect && !e.cancelBubble && (ke.metaKey || ke.ctrlKey) && ke.code === "KeyA") {
            e.preventDefault();
            e.stopPropagation();
            this.toggleSelectionAll(true);
        }
    }

    notifySelectionChanged = (cancelled: boolean) => {
        if (!cancelled) this.setState({ selection: true });
    }

    selectRange(selectionStart: number, selectionEnd: number) {
        const range = this.selectables?.slice(Math.min(selectionStart, selectionEnd), Math.max(selectionStart, selectionEnd) + 1);
        this.selection.reset();
        const cancelled = !this.selection.selectMany(range ?? [], true);
        this.notifySelectionChanged(cancelled);
    }

    toggleSelection(id: string) {
        const cancelled = !this.selection.select(id, !this.selection.selected(id));
        this.notifySelectionChanged(cancelled);
    }

    toggleSelectionAll(state: boolean) {
        this.focusedItem = null;
        const cancelled = state ?
            !this.selection.selectMany(this.selectables ?? [], state) :
            !this.selection.clear();
        this.notifySelectionChanged(cancelled);
    }

    open: MouseEventHandler<HTMLDivElement> = ({ currentTarget: { dataset: { selectable, id } } }) =>
        this.props.open ? selectable && this.props.open(id as string) : undefined;

    static Header({ className, sticky = true, ...other }: PropsWithChildren<HTMLAttributes<HTMLDivElement>> & { sticky?: boolean }) {
        return <div className={`table-caption${sticky ? " sticky-top" : ""}${className ? ` ${className}` : ""}`} {...other} />;
    }

    static Footer(props: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
        return <div {...props} />;
    }

    render() {
        const { className, navigate, selectionFilter = () => false, navigationFilter = () => true, cellTemplate: MainCellTemplate = CellTemplate, cellContext,
            useCheckboxes = false, selectOnClick = false, stickyColumnHeaders = true } = this.props;
        const { source: { items = [], parents = [] } = {} } = this.props.dataContext || {};
        this.selectables = items.filter(selectionFilter).map(i => i.id);
        const children = React.Children.toArray(this.props.children);
        const header = children.find(c => (c as ReactElement)?.type === MediaBrowser.Header);
        const footer = children.find(c => (c as ReactElement)?.type === MediaBrowser.Footer);
        return <div className={`d-flex flex-grow-1 flex-column${className ? ` ${className}` : ""}`} onMouseDown={selectOnClick ? this.onContainerMouseDown : undefined}>
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
                        const selectable = selectionFilter(e);
                        return <div key={e.id} data-id={e.id} data-selectable={selectOnClick && selectable ? 1 : undefined} data-selected={selected} data-active={active}
                            onDoubleClick={e.container && navigationFilter(e) ? navigate : this.open}>
                            {useCheckboxes && <div>
                                <input type="checkbox" onChange={this.onCheckboxChanged} checked={selected} disabled={!selectable} />
                            </div>}
                            <div className="mw-1"><MainCellTemplate data={e} index={index} context={cellContext} /></div>
                            <div className="small text-end">{utils.formatSize(e.res?.size)}</div>
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

const CellTemplate = ({ data: { class: itemClass, albumArts, title, creator, album, res } }: { data: DIDLItem }) =>
    <div className="d-flex align-items-center" title={utils.formatMediaInfo(res) ?? undefined}>
        <AlbumArt itemClass={itemClass} albumArts={albumArts} className="me-2" />
        <span className="text-truncate">
            {title}
            {creator && <>&nbsp;&bull;&nbsp;<small>{creator}</small></>}
            {album && <>&nbsp;&bull;&nbsp;<small>{album}</small></>}
        </span>
    </div>