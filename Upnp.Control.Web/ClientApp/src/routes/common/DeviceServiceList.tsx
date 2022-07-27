import Spoiler from "../../components/Spoiler";
import { DataSourceProps, UpnpService } from "./Types";

export default function ({ "data-source": data }: DataSourceProps<UpnpService[]>) {
    return <Spoiler title="Supported services">
        <ul className="list-group list-group-flush">
            {[data.map(({ url, usn }, i) => <li key={i} className="list-group-item"><a href={url} className="card-link">{usn}</a></li>)]}
        </ul>
    </Spoiler>
}