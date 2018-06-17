import React from "react";
import DeviceInfo from "./DeviceInfo";

export default class DeviceCard extends React.Component {
    
    displayName = DeviceCard.name;

    render() {

        const data = this.props.data;

        return <div class="card bg-light flex-grow">
            <div class="card-header">
                <h5 className="card-title">{data.name}</h5>
                <h6 class="card-subtitle">{data.description}</h6>
            </div>
            <div class="card-body">
                <DeviceInfo data={this.props.data} />
            </div>
            <div className="card-footer">
                <a class="card-link" href={data.descriptionUri}>Metadata</a>
            </div>
        </div>;
    }
}