import React from 'react';
import Spinner from "../Spinner";
import DeviceCard from "./DeviceCard";

export default class DeviceList extends React.Component {
    
    displayName = DeviceList.name;

    constructor(props) {
        super(props);
        this.state = { loading: true, data: [] };
        fetch('/api/discovery').
            then(response => response.json()).
            then(json => this.setState({ loading: false, data: json }));
    }

    render() {

        if (this.state.loading) {
            return <div className="d-flex-fill-center"><Spinner>Loading...</Spinner></div>
        }
        else {
            return (<div class="grid">{
                [this.state.data.map(e => <DeviceCard data={e} class="col-sm-6" />)]
            }
            {
                [this.state.data.map(e => <DeviceCard data={e} class="col-sm-6" />)]
            }
            {
                [this.state.data.map(e => <DeviceCard data={e} class="col-sm-6" />)]
            }</div>);
        }
    }
}