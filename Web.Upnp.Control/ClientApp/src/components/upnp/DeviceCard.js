import React from "react";
import DeviceInfo from "./DeviceInfo";

export default class DeviceCard extends React.Component {

    displayName = DeviceCard.name;

    renderIcon() {
        const icon = this.props.data.icons.find(i => i.w <= 48);
        if (icon) {
            return <img src={icon.url} class="upnp-dev-icon align-self-center" />
        }
        else {
            const iconClass = this.props.data.deviceType == 'urn:schemas-upnp-org:device:MediaRenderer:1' ? 'fa-tv' : 'fa-server';
            return <i class={'fa ' + iconClass + ' upnp-dev-icon align-self-center'} />
        }
    }

        render() {

            const data = this.props.data;

            return <div class="card bg-light flex-grow">
                <div class="card-header d-flex flex-row">
                    {this.renderIcon()}
                    <div>
                        <h5 className="card-title">{data.name}</h5>
                        <h6 class="card-subtitle">{data.description}</h6>
                    </div>
                </div>
                <div class="card-body">
                    <DeviceInfo data={this.props.data} />
                </div>
                <ul className="list-group list-group-flush">
                    {[this.props.data.services.map(s => <li className="list-group-item">
                        <a href={s.url} class="card-link">{s.id}</a>
                    </li>)]}
                </ul>
                <div className="card-footer">
                    <a class="card-link" href={data.url}>Metadata</a>
                </div>
            </div>;
        }
    }