import { ReactNode, useCallback } from "react";
import { LoadIndicatorOverlay } from "../../components/LoadIndicator";
import Toolbar from "../../components/Toolbar";
import { BottomBar } from "./BottomBar";
import BrowserView, { BrowserViewProps } from "./BrowserView";
import Pagination from "./Pagination";
import { useRowStates } from "./RowStateContext";
import $s from "./Settings";

type FetchProps = {
    s?: string;
    p?: string;
};

type RenderFlags = "withBreadcrumb" | "withPagination";

export type BrowserCoreProps<TContext> =
    BrowserViewProps<TContext> & FetchProps &
    { [K in RenderFlags]?: boolean; } &
    { renderActionMenu?: () => ReactNode };

export default function BrowserCore<TContext>(props: BrowserCoreProps<TContext>) {
    useRowStates();
    const { dataContext: data, s: size, p: page, fetching, navigate, renderActionMenu, children } = props;
    const { withBreadcrumb = true, withPagination = true, className, ...forwardProps } = props;
    const { source: { total = 0, parents = undefined, dev = undefined } = {} } = data || {};
    const navBackHandler = useCallback(() => navigate(`../${parents?.[1]?.id ?? "-1"}`), [navigate, parents]);

    return <>
        {fetching && <LoadIndicatorOverlay />}
        <div className={`browser-shell flex-fill overflow-hidden${className ? ` ${className}` : ""}`}>
            <Toolbar className="br px-2 py-1 bg-white border-bottom flex-nowrap">
                <Toolbar.Button glyph="symbols.svg#arrow_back_ios" onClick={navBackHandler} className="btn-round btn-plain" />
                <div className="vstack align-items-stretch overflow-hidden text-center text-md-start mx-1">
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