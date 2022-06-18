import { Component, ComponentType } from "react";
import { DataFetchProps } from "../../components/DataFetch";
import { GridView, GridViewMode } from "../../components/GridView";
import { LoadIndicatorOverlay } from "../../components/LoadIndicator";
import { DeviceDiscoveryNotifier } from "./DeviceDiscoveryNotifier";
import $s from "./Settings";
import { CategoryRouteParams, DataSourceProps, DeviceRouteParams, UpnpDevice } from "./Types";

export type TemplatedDataComponentProps<T = any, P = {}> = { itemTemplate: ComponentType<DataSourceProps<T> & P> }

type DeviceViewProps = DataFetchProps<UpnpDevice> &
    TemplatedDataComponentProps<UpnpDevice, DeviceRouteParams> &
    DeviceRouteParams & { viewMode?: GridViewMode };

const gridEmptyClass = "align-content-center align-items-center";

export function DeviceView({ itemTemplate: Item, dataContext, category, fetching, viewMode }: DeviceViewProps) {
    const empty = !fetching && !dataContext?.source;
    return <>
        {fetching && <LoadIndicatorOverlay />}
        <GridView viewMode={viewMode} className={empty ? gridEmptyClass : ""}>
            {dataContext?.source && <Item data-source={dataContext.source} category={category} device={dataContext.source.udn} />}
            {empty ? <span className="text-center text-muted">No device found</span> : null}
        </GridView>
    </>;
}

export type DeviceListViewProps = TemplatedDataComponentProps<UpnpDevice, DeviceRouteParams> &
    CategoryRouteParams & { viewMode?: GridViewMode };

export class DeviceListView extends Component<DeviceListViewProps & DataFetchProps<UpnpDevice[]>> {
    static defaultProps: Partial<DeviceListViewProps> = { viewMode: "grid" }

    reload = () => {
        this.props.dataContext?.reload();
        return $s.get("showDiscoveryNotifications");
    }

    render() {
        const { dataContext, itemTemplate: Item, fetching, category, viewMode } = this.props;
        const list = dataContext?.source;
        const empty = !fetching && list?.length == 0;
        return <>
            {fetching && <LoadIndicatorOverlay />}
            <GridView viewMode={viewMode} className={empty ? gridEmptyClass : ""}>
                {list?.length ? list.map(item => <Item key={item.udn} data-source={item} category={category} device={item.udn} />) : null}
                {empty ? <span className="text-center text-muted">No devices discovered</span> : null}
            </GridView>
            <DeviceDiscoveryNotifier callback={this.reload} />
        </>
    }
}