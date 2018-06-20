import React from "react";
import Icon from "../Icon"

export default class DeviceServiceList extends React.Component {

    displayName = DeviceServiceList.name;

    render() {

        const target = `card-${this.props.id}`;

        return <div>
                   <button className="btn btn-block btn-light text-left" aria-expanded="false" role="button"
                           data-toggle="collapse" data-target={`#${target}`} data-controls={target} >
                       <Icon glyph="angle-down"/>Services
                   </button>
                   <div className="collapse" id={target}>
                       <ul className="list-group">
                           {[
                               this.props.data.map(s =>
                                   <li className="list-group-item">
                                   <a href={s.url} className="card-link">{s.id}</a>
                               </li>)
                           ]}
                       </ul>
                   </div>
               </div>;
    }
}