import { HTMLAttributes } from "react";
import { DataFetchProps } from "../../components/DataFetch";
import { ViewerRouteProps } from "./BrowserUtils";
import { BrowseFetchResult } from "./Types";

export function MediaViewer(props: HTMLAttributes<HTMLDivElement> & DataFetchProps<BrowseFetchResult> & ViewerRouteProps) {
    return <div className="flex-fill overflow-hidden p-3 d-flex flex-column">
        <h3>{props.dataContext?.source.self?.title}</h3>
        <video controls autoPlay={false}>
            <source src={props.dataContext?.source.self?.res?.url} />
        </video>
    </div>;
}