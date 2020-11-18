import React from "react";
import Breadcrumb from "./Breadcrumb";
import Pagination from "./Pagination";
import BrowserCore from "./BrowserCore";
import { LoadIndicatorOverlay } from "../../components/LoadIndicator";
import $config from "./Config";
import { DataFetchProps } from "../../components/DataFetch";
import { RouteComponentProps } from "react-router";
import { BrowseFetchResult, DIDLItem } from "./Types";

type PropsType = DataFetchProps<BrowseFetchResult> & RouteComponentProps & {
    s: string;
    p: string;
};

export default function (props: PropsType) {
    const { dataContext: data, match, s: size, p: page, fetching } = props;
    const { source: { total = 0, items: { length: fetched = 0 } = {}, parents = undefined } = {} } = data || {};
    return <div className="d-flex flex-column h-100 position-relative">
        {fetching && <LoadIndicatorOverlay />}
        <div className="flex-grow-1">
            <BrowserCore {...props}>
                <BrowserCore.Header className="p-0">
                    <Breadcrumb items={parents} path={match.path} params={match.params} />
                </BrowserCore.Header>
            </BrowserCore>
        </div>
        {total !== 0 && fetched !== total &&
            <div className="sticky-bottom">
                <Pagination baseUrl={match.url} className="border-1 border-secondary border-top"
                    total={total} current={parseInt(page) || 1} pageSize={parseInt(size) || $config.pageSize} />
            </div>}
    </div>;
}