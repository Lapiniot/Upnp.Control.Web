﻿import { Component, ComponentType } from "react";
import { DataFetchProps } from "../../components/DataFetch";
import { GridView, GridViewMode } from "../../components/GridView";
import { DeviceDiscoveryNotifier } from "./DeviceDiscoveryNotifier";
import $s from "./Settings";
import { CategoryRouteParams, UpnpDevice } from "./Types";

export type DeviceViewProps = TemplatedDataComponentProps<DataSourceProps<UpnpDevice> & CategoryRouteParams> &
    CategoryRouteParams & { viewMode?: GridViewMode };

const gridEmptyClass = "align-content-center align-items-center";

export function DeviceView({ itemTemplate: Item, dataContext, category, fetching, viewMode }: DeviceViewProps & DataFetchProps<UpnpDevice>) {
    const data = fetching && !dataContext?.source ? undefined : dataContext?.source;
    const empty = !fetching && data;
    return <GridView viewMode={viewMode} className={empty ? gridEmptyClass : ""}>
        {data && <Item dataSource={data} category={category} />}
        {empty ? <span className="text-center text-muted">No device found</span> : null}
    </GridView>
}

export class DeviceListView extends Component<DeviceViewProps & DataFetchProps<UpnpDevice[]>> {
    static defaultProps: Partial<DeviceViewProps> = { viewMode: "grid" }

    reload = () => {
        this.props.dataContext?.reload();
        return $s.get("showDiscoveryNotifications");
    }

    render() {
        const { dataContext, itemTemplate: Item, fetching, category, viewMode } = this.props;
        const list = fetching && !dataContext?.source
            ? Array.from<UpnpDevice | undefined>({ length: $cfg[category]?.placeholders?.count ?? $cfg.placeholders.count })
            : dataContext?.source;
        const empty = !fetching && list?.length == 0;
        return <>
            <GridView viewMode={viewMode} className={empty ? gridEmptyClass : ""}>
                {list?.length ? list.map((item, index) => <Item key={item ? item.udn : `tmp-${index}`}
                    dataSource={item} category={category} />) : null}
                {empty ? <span className="text-center text-muted">No devices discovered</span> : null}
            </GridView>
            <DeviceDiscoveryNotifier callback={this.reload} />
        </>
    }
}