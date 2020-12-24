import React, { HTMLAttributes } from "react";
import Breadcrumb from "./Breadcrumb";
import Pagination from "./Pagination";
import BrowserCore, { BrowserCoreProps } from "./BrowserCore";
import { LoadIndicatorOverlay } from "../../components/LoadIndicator";
import $config from "./Config";
import { DataFetchProps } from "../../components/DataFetch";
import { RouteComponentProps } from "react-router";
import { BrowseFetchResult } from "./Types";
import { NavigatorProps } from "./Navigator";

type FetchProps = {
    s?: string;
    p?: string;
};

export type BrowserProps = BrowserCoreProps &
    DataFetchProps<BrowseFetchResult> &
    HTMLAttributes<HTMLDivElement> &
    NavigatorProps &
    RouteComponentProps<FetchProps> &
    FetchProps

export default function (props: BrowserProps) {
    const { dataContext: data, match, s: size, p: page, fetching } = props;
    const { source: { total = 0, items: { length: fetched = 0 } = {}, parents = undefined } = {} } = data || {};
    return <>
        { fetching && <LoadIndicatorOverlay />}
        <BrowserCore {...props}>
            <BrowserCore.Header className="p-0">
                <Breadcrumb items={parents} path={match.path} params={match.params} />
            </BrowserCore.Header>
        </BrowserCore>
        {
            total !== 0 && fetched !== total &&
            <Pagination baseUrl={match.url} className="border-top sticky-bottom"
                total={total} current={typeof page === "string" ? parseInt(page) : 1}
                pageSize={size === "string" ? parseInt(size) : $config.pageSize} />
        }
    </>
}