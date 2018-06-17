import React from 'react';

export default class DeviceInfo extends React.Component {

    displayName = DeviceInfo.name;

    render() {
        const data = this.props.data;

        return <div className="form-table">
            <div>
                <div>USN</div>
                <div>{data.usn}</div>
            </div>
            <div>
                <div>Type</div>
                <div>{data.deviceType}</div>
            </div>
            <div>
                <div>Maker</div>
                <div>{data.manufacturer}</div>
            </div>
            <div>
                <div>Model</div>
                <div>{data.modelName}</div>
            </div>
            <div>
                <div>Model #</div>
                <div>{data.modelNumber}</div>
            </div>
        </div>
    }
}