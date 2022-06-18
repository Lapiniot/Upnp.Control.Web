import { Link } from "../../components/NavLink";
import { DataSourceProps, UpnpDevice } from "./Types";

export default function ({ "data-source": { udn, type, maker, makerUrl, model, modelUrl, modelNumber } }: DataSourceProps<UpnpDevice>) {
    return <div className="d-grid grid-auto-1fr grid-form gapx-2 gapy-1 mb-2 text-wrap no-font-boost">
        <div>UDN</div>
        <div>{udn}</div>
        <div>Type</div>
        <div>{type}</div>
        <div>Maker</div>
        <div>{makerUrl ? <Link to={makerUrl} className="p-0">{maker}</Link> : maker}</div>
        <div>Model</div>
        <div>{modelUrl ? <Link to={modelUrl} className="p-0">{model}</Link> : model}</div>
        <div>Model #</div>
        <div>{modelNumber}</div>
    </div>;
}