import React from 'react';

class DeviceCard extends React.Component {
    render() {
        const data = this.props.data;

        return <div class="card ml-0 bg-light w-auto">
            <div class="card-header">
                <h5 className="card-title">{data.name}</h5>
                <h6 class="card-subtitle">{data.description}</h6>
            </div>
            <div class="card-body">
                <div className="d-table">
                    <div className="d-table-row">
                        <div className="d-table-cell text-right">USN:</div>
                        <div className="d-table-cell text-truncate">{data.usn}</div>
                    </div>
                    <div className="d-table-row">
                        <div className="d-table-cell text-right">Device Type:</div>
                        <div className="d-table-cell text-truncate">{data.deviceType}</div>
                    </div>
                    <div className="d-table-row">
                        <div className="d-table-cell text-right">Manufacturer:</div>
                        <div className="d-table-cell">{data.manufacturer}</div>
                    </div>
                    <div className="d-table-row">
                        <div className="d-table-cell text-right">Model Name:</div>
                        <div className="d-table-cell">{data.modelName}</div>
                    </div>
                    <div className="d-table-row">
                        <div className="d-table-cell text-right">Model Number:</div>
                        <div className="d-table-cell">{data.modelNumber}</div>
                    </div>
                </div>
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
        return (<div class="card-deck ml-0">{
            [this.state.data.map(e => <DeviceCard data={e} />)]
        }</div>);
    }
}