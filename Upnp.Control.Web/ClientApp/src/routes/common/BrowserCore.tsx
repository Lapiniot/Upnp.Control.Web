import { ReactNode, useCallback } from "react";
import Progress from "../../components/Progress";
import { useRowStates } from "../../components/RowStateContext";
import Toolbar from "../../components/Toolbar";
import { useInfiniteScroll } from "../../hooks/InfiniteScroll";
import BrowserView, { BrowserViewProps } from "./BrowserView";

export type BrowserCoreProps<TContext> =
    BrowserViewProps<TContext> &
    { renderActions?: () => ReactNode };

export default function BrowserCore<TContext>(props: BrowserCoreProps<TContext>) {
    const { dataContext: data, fetching, navigate, renderActions, children } = props;
    const { className, ...forwardProps } = props;
    const { source: { parents = undefined, device: dev = undefined } = {} } = data || {};

    const navBackHandler = useCallback(() => navigate(`../${parents?.[1]?.id ?? "-1"}`), [navigate, parents]);
    useRowStates();

    const scrollTracker = useInfiniteScroll(data?.next, undefined, "0px 0px 50px 0px");
    const progress = (data?.source.items?.length ?? 0) / (data?.source.total ?? 1);

    return <div className={`browser-shell flex-fill overflow-hidden${className ? ` ${className}` : ""}`}>
        <Toolbar className="topbar">
            <Toolbar.Button icon="symbols.svg#arrow_back_ios_new" onClick={navBackHandler} />
            <div className="vstack flex-1 overflow-hidden justify-content-center align-items-stretch text-center text-md-start">
                <h6 className="mb-0 text-truncate">{parents?.[0]?.title ?? ""}</h6>
                <small className="text-truncate">{dev?.name ?? ""}</small>
            </div>
            {renderActions?.()}
        </Toolbar>
        <BrowserView className="br-area-main mt-1" {...forwardProps}>
            {scrollTracker}
            {children}
        </BrowserView>
        <Progress className={`br-area-main place-self-start-stretch sticky-top m-0${progress === 1 && !fetching ? " d-none" : ""}`}
            value={progress} infinite={fetching} />
        {data?.source.items?.length === 0 &&
            <div className="br-area-main d-flex align-items-center justify-content-center">
                <svg className="icon-5x"><use href="symbols.svg#folder" /></svg>
            </div>}
    </div>
}