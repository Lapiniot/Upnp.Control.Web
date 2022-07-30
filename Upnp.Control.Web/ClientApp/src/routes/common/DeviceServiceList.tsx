import Spoiler from "../../components/Spoiler";
import { UpnpService } from "./Types";

export default function ({ dataSource: services }: DataSourceProps<UpnpService[]>) {
    return <Spoiler title="Supported services" disabled={!services}>
        <ul className="list-group list-group-flush">
            {[services?.map(({ url, usn }, i) => <li key={i} className="list-group-item"><a href={url} className="card-link">{usn}</a></li>)]}
        </ul>
    </Spoiler>
}