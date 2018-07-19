import React from "react";
import DataView from "../../components/DataView";

const containerClassName = "d-grid grid-c1 grid-xl-c2 grid-xxxl-c3 grid-xxxxl-c4 py-3 px-3";

export default class DeviceList extends React.Component {

    displayName = DeviceList.name;

    render() {
        return <DataView containerTemplate={"div"} containerProps={{ className: containerClassName }} {...this.props} />;
    }
}