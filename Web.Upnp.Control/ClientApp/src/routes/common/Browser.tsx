import Breadcrumb from "./Breadcrumb";
import { TablePagination } from "./Pagination";
import BrowserView, { BrowserViewProps } from "./BrowserView";
import { LoadIndicatorOverlay } from "../../components/LoadIndicator";
import { RouteComponentProps } from "react-router";
import $s from "./Config";

type FetchProps = {
    s?: string;
    p?: string;
};

export type BrowserCoreProps = BrowserViewProps & RouteComponentProps<FetchProps> & FetchProps

export default function BrowserCore(props: BrowserCoreProps) {
    const { dataContext: data, match, s: size, p: page, fetching } = props;
    const { source: { total = 0, parents = undefined } = {} } = data || {};
    return <>
        {fetching && <LoadIndicatorOverlay />}
        <div className="flex-expand d-flex flex-column">
            <Breadcrumb items={parents} path={match.path} params={match.params} className="sticky-top border-bottom" />
            <BrowserView {...props} className="flex-expand" />
            <TablePagination location={props.location} history={props.history}
                className="bg-light border-top sticky-bottom py-1 px-3 justify-content-end"
                total={total} current={typeof page === "string" ? parseInt(page) : 1}
                pageSize={typeof size === "string" ? parseInt(size) : $s.get("pageSize")} />
        </div>
    </>
}