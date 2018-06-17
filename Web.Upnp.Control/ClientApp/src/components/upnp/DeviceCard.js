import React from "react";
import DeviceInfo from "./DeviceInfo";

export default class DeviceCard extends React.Component {

    displayName = DeviceCard.name;

    render() {

        const data = this.props.data;

        const icon = data.icons.find(i => i.w <= 48);

        return <div class="card bg-light flex-grow">
            <div class="card-header d-flex flex-row">
                {icon && <img src={icon.url} class="upnp-dev-icon align-self-center"/> || <i class="fa fa-server upnp-dev-icon align-self-center"/>}
                <div>
                    <h5 className="card-title">{data.name}</h5>
                    <h6 class="card-subtitle">{data.description}</h6>
                </div>
            </div>
            <div class="card-body">
                <DeviceInfo data={this.props.data} />
            </div>
            <div className="card-footer">
                <a class="card-link" href={data.url}>Metadata</a>
            </div>
        </div>;
    }
}