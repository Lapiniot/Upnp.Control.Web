import React from "react";
import Spoiler from "../Spoiler";

export default class DeviceServiceList extends React.Component {

    displayName = DeviceServiceList.name;

    render() {

        return <Spoiler title="Supported services" uniqueId={`card-${this.props["data-id"]}-s`}>
                   <ul className="list-group">
                       {[
                           this.props["data-source"].map(s =>
                               <li className="list-group-item">
                                   <a href={s.url} className="card-link">{s.id}</a>
                               </li>)
                       ]}
                   </ul>
               </Spoiler>;
    }
}