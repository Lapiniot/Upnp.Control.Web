import React from "react";

export default class DeviceServiceList extends React.Component {

    displayName = DeviceServiceList.name;

    render() {

        const target = `card-${this.props.id}`;

        return <div>
            <a className="card-link" data-toggle="collapse" href={`#${target}`}
                      role="button" aria-expanded="false">
                       Services
                   </a>
            <div className="collapse" id={target}>
                       <ul className="list-group list-group-flush">
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