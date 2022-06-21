import { Link } from "../../components/NavLink";
import { DataSourceProps, UpnpDevice } from "./Types";

export default function ({ "data-source": { udn, type, maker, makerUrl, model, modelUrl, modelNumber } }: DataSourceProps<UpnpDevice>) {
    return <div className="grid-form grid-form-dense mb-2 text-wrap no-font-boost">
        <span>UDN</span>
        <span>{udn}</span>
        <span>Type</span>
        <span>{type}</span>
        <span>Maker</span>
        <span>{makerUrl ? <Link to={makerUrl} className="p-0">{maker}</Link> : maker}</span>
        <span>Model</span>
        <span>{modelUrl ? <Link to={modelUrl} className="p-0">{model}</Link> : model}</span>
        <span>Model #</span>
        <span>{modelNumber}</span>
    </div>;
}