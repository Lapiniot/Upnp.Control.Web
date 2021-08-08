import { ReactNode, useCallback } from "react";
import { LoadIndicatorOverlay } from "../../components/LoadIndicator";
import Toolbar from "../../components/Toolbar";
import { BottomBar } from "./BottomBar";
import BrowserView, { BrowserViewProps } from "./BrowserView";
import { TablePagination } from "./Pagination";
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
    const { dataContext: data, s: size, p: page, fetching, navigate, renderActionMenu } = props;
    const { withBreadcrumb = true, withPagination = true, className, ...forwardProps } = props;
    const { source: { total = 0, parents = undefined, dev = undefined } = {} } = data || {};
    const navBackHandler = useCallback(() => navigate({ id: parents?.[1]?.id ?? "-1" }), [navigate, parents]);

    return <>
        {fetching && <LoadIndicatorOverlay />}
        <div className={`vstack overflow-hidden${className ? ` ${className}` : ""}`}>
            <Toolbar className="px-2 py-1 bg-white border-bottom flex-nowrap">
                <Toolbar.Button key="nav-parent" glyph="chevron-left" onClick={navBackHandler} className="btn-round btn-icon btn-plain" />
                <div className="vstack align-items-stretch overflow-hidden text-center text-md-start mx-1">
                    <h6 className="mb-0 text-truncate">{parents?.[0]?.title ?? ""}</h6>
                    <small className="text-muted text-truncate">{dev?.name ?? ""}</small>
                </div>
                <Toolbar.Button key="main-menu" glyph="ellipsis-v" data-bs-toggle="dropdown"
                    className="btn-round btn-icon btn-plain ms-auto" disabled={!renderActionMenu} />
                {renderActionMenu?.()}
            </Toolbar>
            <BrowserView className="flex-fill" {...forwardProps} />
            {withPagination && <BottomBar>
                <TablePagination total={total} current={typeof page === "string" ? parseInt(page) : 1}
                    pageSize={typeof size === "string" ? parseInt(size) : $s.get("pageSize")} />
            </BottomBar>}
        </div>
    </>
}