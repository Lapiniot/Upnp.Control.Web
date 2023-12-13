import { useCallback, useEffect, useRef } from "react";
import { DataFetchProps } from "../../hooks/DataFetch";
import { GridView, GridViewMode } from "../../components/GridView";
import { useLocalStorage } from "../../hooks/LocalStorage";
import { LoadIndicatorOverlay } from "../../components/LoadIndicator";
import { DeviceDiscoveryNotifier } from "./DeviceDiscoveryNotifier";
import $s from "./Settings";

export type DeviceViewProps = TemplatedDataComponentProps<DataSourceProps<Upnp.Device> & UI.CategoryRouteParams> &
    UI.CategoryRouteParams & { viewMode?: GridViewMode }

const gridEmptyClass = "align-content-center align-items-center"

export function DeviceView({ itemTemplate: Item, dataContext, category, fetching, viewMode }: DeviceViewProps & DataFetchProps<Upnp.Device>) {
    const data = fetching && !dataContext?.source ? undefined : dataContext?.source;
    const empty = !fetching && !data;
    return <GridView viewMode={viewMode} className={empty ? gridEmptyClass : ""}>
        {!empty
            ? <Item dataSource={data} category={category} />
            : <span className="text-center text-muted">No device found</span>}
    </GridView>
}

type DeviceListViewProps = DeviceViewProps & DataFetchProps<Upnp.Device[]>;

export function DeviceListView({ dataContext, fetching, category, viewMode = "grid", itemTemplate: Item }: DeviceListViewProps) {

    const dataContextRef = useRef<typeof dataContext>();

    const reload = useCallback(() => {
        dataContextRef.current?.reload();
        return $s.get("showDiscoveryNotifications");
    }, []);

    useEffect(() => { dataContextRef.current = dataContext; }, [dataContext]);

    const useSkeletons = $cfg[category]?.useSkeletons ?? $cfg.useSkeletons;
    const [count, setCount] = useLocalStorage(`cache:${category}:count`);
    const list = useSkeletons && fetching && !dataContext?.source
        ? Array.from<Upnp.Device | undefined>({ length: count ? Number(count) : $cfg[category]?.placeholders?.count ?? $cfg.placeholders.count })
        : dataContext?.source;
    const empty = !fetching && list?.length == 0;

    if (!fetching && dataContext?.source) {
        setCount(String(dataContext.source.length));
    }

    return <>
        {fetching && !useSkeletons && <LoadIndicatorOverlay />}
        <GridView viewMode={viewMode} className={empty ? gridEmptyClass : ""}>
            {list?.length ? list.map((item, i) => <Item key={i} dataSource={item} category={category} />) : null}
            {empty ? <span className="text-center text-muted">No devices discovered</span> : null}
        </GridView>
        <DeviceDiscoveryNotifier callback={reload} />
    </>
}