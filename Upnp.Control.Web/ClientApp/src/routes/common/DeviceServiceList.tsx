import Spoiler from "../../components/Spoiler";

export default function ({ dataSource: services }: DataSourceProps<Upnp.Service[]>) {
    return <Spoiler caption="Supported services" className="spoiler-flush" disabled={!services}>
        <ul className="list-group list-group-bare">
            {[services?.map(({ url, usn }, i) => <li key={i} className="list-group-item"><a href={url} className="card-link">{usn}</a></li>)]}
        </ul>
    </Spoiler>
}