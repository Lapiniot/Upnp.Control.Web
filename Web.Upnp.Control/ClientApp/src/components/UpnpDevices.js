import React from 'react';

class DeviceInfo extends React.Component {
    render() {

        const data = this.props.data;

        return <div className="form-table">
            <div>
                <div>USN</div>
                <div>{data.usn}</div>
            </div>
            <div>
                <div>Device Type</div>
                <div>{data.deviceType}</div>
            </div>
            <div>
                <div>Manufacturer</div>
                <div>{data.manufacturer}</div>
            </div>
            <div>
                <div>Model Name</div>
                <div>{data.modelName}</div>
            </div>
            <div>
                <div>Model Number</div>
                <div>{data.modelNumber}</div>
            </div>
        </div>
    }
}

class DeviceCard extends React.Component {
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

export default class UpnpDevices extends React.Component {
    displayName = UpnpDevices.name;

    constructor(props) {
        super(props);
        this.state = { loading: true, data: [] };
        fetch('/api/discovery').
            then(response => response.json()).
            then(json => this.setState({ loading: false, data: json }));
    }

    render() {
        if (this.state.loading) {
            return <div>Loading...</div>
        }
        else {
            return (<div class="d-flex flex-row flex-wrap ">{
                [this.state.data.map(e => <DeviceCard data={e} />)]
            }</div>);
        }
    }
}