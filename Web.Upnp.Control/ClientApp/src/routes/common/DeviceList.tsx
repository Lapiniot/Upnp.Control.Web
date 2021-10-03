﻿import React, { ComponentType, HTMLAttributes } from "react";
import { LoadIndicatorOverlay } from "../../components/LoadIndicator";
import { CategoryRouteParams, DataSourceProps, DeviceRouteParams, UpnpDevice } from "./Types";
import { DataFetchProps } from "../../components/DataFetch";
import { DeviceDiscoveryNotifier } from "./DeviceDiscoveryNotifier";

export type TemplatedDataComponentProps<T = any, P = {}> = { itemTemplate: ComponentType<DataSourceProps<T> & P> }

export type ViewMode = "grid" | "carousel" | "auto";

function GridContainer({ viewMode, className, children, ...other }: HTMLAttributes<HTMLDivElement> & { viewMode?: ViewMode }) {
    const viewClass = viewMode === "grid"
        ? "grid-responsive-auto"
        : viewMode === "carousel"
            ? "grid-carousel"
            : "grid-carousel grid-responsive-auto-lg";
    return <div {...other} className={`d-grid grid-scroll-snap ${viewClass}${className ? " " + className : ""}`}>
        {children}
    </div>;
}

type DeviceContainerProps = DataFetchProps<UpnpDevice> &
    TemplatedDataComponentProps<UpnpDevice, DeviceRouteParams> &
    DeviceRouteParams & { viewMode?: ViewMode };

export function DeviceContainer({ itemTemplate: Item, dataContext, category, fetching, viewMode }: DeviceContainerProps) {
    return <>
        {fetching && <LoadIndicatorOverlay />}
        <GridContainer viewMode={viewMode}>
            {dataContext?.source && <Item data-source={dataContext.source} category={category} device={dataContext.source.udn} />}
        </GridContainer>
    </>;
}

type DeviceListContainerProps = DataFetchProps<UpnpDevice[]> &
    TemplatedDataComponentProps<UpnpDevice, DeviceRouteParams> &
    CategoryRouteParams & { viewMode?: ViewMode };

export class DeviceListContainer extends React.Component<DeviceListContainerProps> {
    static defaultProps: Partial<DeviceListContainerProps> = { viewMode: "grid" }

    reload = () => {
        this.props.dataContext?.reload();
    }

    render() {
        const { dataContext, itemTemplate: Item, fetching, category, viewMode } = this.props;
        return <>
            {fetching && <LoadIndicatorOverlay />}
            <GridContainer viewMode={viewMode}>
                {[dataContext?.source.map(item => <Item key={item.udn} data-source={item} category={category} device={item.udn} />)]}
            </GridContainer>
            <DeviceDiscoveryNotifier callback={this.reload} />
        </>
    }
}