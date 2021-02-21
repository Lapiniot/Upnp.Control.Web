import { NavLink } from "../../components/NavLink";
import { DataSourceProps, UpnpDevice } from "./Types";

export default function ({ "data-source": { udn, type, maker, makerUrl, model, modelUrl, modelNumber } }: DataSourceProps<UpnpDevice>) {
    return <div className="d-grid grid-auto-1fr grid-form gapx-2 gapy-1 mb-2 text-nowrap">
        <div>UDN</div>
        <div>{udn}</div>
        <div>Type</div>
        <div>{type}</div>
        <div>Maker</div>
        <div>{makerUrl ? <NavLink to={makerUrl} className="p-0">{maker}</NavLink> : maker}</div>
        <div>Model</div>
        <div>{modelUrl ? <NavLink to={modelUrl} className="p-0">{model}</NavLink> : model}</div>
        <div>Model #</div>
        <div>{modelNumber}</div>
    </div>;
}