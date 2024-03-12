import { ReactNode, useCallback } from "react";
import { BottomBar } from "../../components/BottomBar";
import { LoadIndicatorOverlay } from "../../components/LoadIndicator";
import { useRowStates } from "../../components/RowStateContext";
import Toolbar from "../../components/Toolbar";
import BrowserView, { BrowserViewProps } from "./BrowserView";
import Pagination from "./Pagination";
import $s from "./Settings";

type FetchProps = {
    s?: string;
    p?: string;
};

type RenderFlags = "withPagination";

export type BrowserCoreProps<TContext> =
    BrowserViewProps<TContext> & FetchProps &
    { [K in RenderFlags]?: boolean; } &
    { renderActionMenu?: () => ReactNode };

export default function BrowserCore<TContext>(props: BrowserCoreProps<TContext>) {
    useRowStates();
    const { dataContext: data, s: size, p: page, fetching, navigate, renderActionMenu, children } = props;
    const { withPagination = true, className, ...forwardProps } = props;
    const { source: { total = 0, parents = undefined, device: dev = undefined } = {} } = data || {};
    const navBackHandler = useCallback(() => navigate(`../${parents?.[1]?.id ?? "-1"}`), [navigate, parents]);

    return <>
        {fetching && <LoadIndicatorOverlay />}
        <div className={`browser-shell flex-fill overflow-hidden${className ? ` ${className}` : ""}`}>
            <Toolbar className="overflow-hidden toolbar-compact px-2 py-1 border-bottom flex-nowrap">
                <Toolbar.Button glyph="symbols.svg#arrow_back_ios_new" onClick={navBackHandler} />
                <div className="vstack align-items-stretch overflow-hidden text-center text-md-start">
                    <h6 className="mb-0 text-truncate">{parents?.[0]?.title ?? ""}</h6>
                    <small className="text-muted text-truncate">{dev?.name ?? ""}</small>
                </div>
                {renderActionMenu?.()}
            </Toolbar>
            <BrowserView className="br-area-main" {...forwardProps}>
                {children}
            </BrowserView>
            {!fetching && data?.source.items?.length === 0 &&
                <div className="br-area-main text-muted d-flex align-items-center justify-content-center">
                    <svg className="icon icon-5x"><use href="symbols.svg#folder" /></svg>
                </div>}
            {withPagination && <BottomBar className="br-area-bottom">
                <Pagination total={total} current={typeof page === "string" ? parseInt(page) : 1}
                    pageSize={typeof size === "string" ? parseInt(size) : $s.get("pageSize")} />
            </BottomBar>}
        </div>
    </>
}