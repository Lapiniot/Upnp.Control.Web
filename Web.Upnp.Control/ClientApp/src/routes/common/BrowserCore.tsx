import Breadcrumb from "./Breadcrumb";
import { TablePagination } from "./Pagination";
import BrowserView, { BrowserViewProps } from "./BrowserView";
import { LoadIndicatorOverlay } from "../../components/LoadIndicator";
import { RouteComponentProps } from "react-router";
import $s from "./Settings";
import React, { useCallback } from "react";
import { BottomBar } from "./BottomBar";

type FetchProps = {
    s?: string;
    p?: string;
};

type RenderFlags = "withBreadcrumb" | "withPagination";

export type BrowserCoreProps<TContext> =
    BrowserViewProps<TContext> &
    RouteComponentProps<FetchProps> &
    FetchProps & { [K in RenderFlags]?: boolean };

export default function BrowserCore<TContext>(props: BrowserCoreProps<TContext>) {
    const { dataContext: data, match, s: size, p: page, fetching } = props;
    const { withBreadcrumb = true, withPagination = true, className, ...forwardProps } = props;
    const { source: { total = 0, parents = undefined } = {} } = data || {};
    return <>
        {fetching && <LoadIndicatorOverlay />}
        <div className={`flex-fill d-flex flex-column${className ? ` ${className}` : ""}`}>
            {withBreadcrumb && <Breadcrumb items={parents} path={match.path} params={match.params} className="sticky-top border-bottom d-none-h-before-sm" />}
            <BrowserView className="flex-fill" {...forwardProps} />
            {withPagination && <BottomBar>
                <TablePagination location={props.location} history={props.history}
                    total={total} current={typeof page === "string" ? parseInt(page) : 1}
                    pageSize={typeof size === "string" ? parseInt(size) : $s.get("pageSize")} />
            </BottomBar>}
        </div>
    </>
}