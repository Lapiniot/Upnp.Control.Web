import React from "react";
import Spoiler from "../Spoiler";

export default class DeviceServiceList extends React.Component {

    displayName = DeviceServiceList.name;

    render() {

        const { "data-source": data, "data-row-id": id } = this.props;

        return <Spoiler title="Supported services" uniqueId={`card-${id}-s`}>
                   <ul className="list-group list-group-flush">
                       {[
                    data.map(s =>
                        <li className="list-group-item">
                            <a href={s.url} className="card-link">{s.id}</a>
                        </li>)
                ]}
                   </ul>
               </Spoiler>;
    }
}