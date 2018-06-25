import React from "react";

export default class DeviceInfo extends React.Component {

    displayName = DeviceInfo.name;

    render() {
        const data = this.props.data;

        return <div className="form-table">
                   <div>
                       <div>UDN</div>
                       <div>{data.udn}</div>
                   </div>
                   <div>
                       <div>Type</div>
                       <div>{data.type}</div>
                   </div>
                   <div>
                       <div>Maker</div>
                       <div>{data.maker}</div>
                   </div>
                   <div>
                       <div>Model</div>
                       <div>{data.model}</div>
                   </div>
                   <div>
                       <div>Model #</div>
                       <div>{data.modelNumber}</div>
                   </div>
               </div>;
    }
}