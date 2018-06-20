import React from "react";
import DataView from "../DataView";

class GridView extends React.Component{
    render(){
        
    }
}

export default class DeviceList extends React.Component {

    displayName = DeviceList.name;

    render() {
        return <DataView data-uri="api/discovery" containerTemplate="div" />;
    }
}