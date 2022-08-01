import { HTMLAttributes } from "react";
import { Link } from "../../components/NavLink";

const cntrClass = "grid-form grid-form-dense mb-2 text-wrap no-font-boost";

type DeviceInfoProps = HTMLAttributes<HTMLDivElement> & DataSourceProps<Upnp.Device>;

export default function ({ dataSource: device, className, ...props }: DeviceInfoProps) {
    const { udn, type, maker, makerUrl, model, modelUrl, modelNumber } = device ?? {};
    const cls = `${cntrClass}${className ? ` ${className}` : ""}`;
    return device ? <div className={cls} {...props}>
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
    </div> : <div className={cls} {...props}>
        <span>UDN</span>
        <span className="placeholder w-75">&nbsp;</span>
        <span>Type</span>
        <span className="placeholder w-75">&nbsp;</span>
        <span>Maker</span>
        <span className="placeholder">&nbsp;</span>
        <span>Model</span>
        <span className="placeholder w-50">&nbsp;</span>
        <span>Model #</span>
        <span className="placeholder w-25">&nbsp;</span>
    </div>
}