import { HTMLAttributes } from "react";
import Breadcrumb from "./Breadcrumb";
import { TablePagination } from "./Pagination";
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
    const { source: { total = 0, parents = undefined } = {} } = data || {};
    return <>
        { fetching && <LoadIndicatorOverlay />}
        <BrowserCore {...props}>
            <BrowserCore.Header className="p-0">
                <Breadcrumb items={parents} path={match.path} params={match.params} />
            </BrowserCore.Header>
        </BrowserCore>
        <TablePagination location={props.location} history={props.history}
            className="bg-light border-top sticky-bottom py-1 px-3 justify-content-end"
            total={total} current={typeof page === "string" ? parseInt(page) : 1}
            pageSize={typeof size === "string" ? parseInt(size) : $config.pageSize} />
    </>
}