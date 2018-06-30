import React from "react";

export default class DeviceInfo extends React.Component {

    displayName = DeviceInfo.name;

    render() {
        const { "data-source": d } = this.props;

        return <div className="form-table">
            <div>
                <div>UDN</div>
                <div>{d.udn}</div>
            </div>
            <div>
                <div>Type</div>
                <div>{d.type}</div>
            </div>
            <div>
                <div>Maker</div>
                <div>{d.maker}</div>
            </div>
            <div>
                <div>Model</div>
                <div>{d.model}</div>
            </div>
            <div>
                <div>Model #</div>
                <div>{d.modelNumber}</div>
            </div>
        </div>;
    }
}