"use strict";
import React from "react";
import Spinner from "./Spinner";

class LoaderPlaceholder extends React.Component {
    render() {
        return <div className="d-flex-fill-center">
                   <Spinner>{this.props.text || "Loading data..."}</Spinner>
               </div>;
    }
}

export default class DataView extends React.Component {

    displayName = DataView.name;

    constructor(props) {
        super(props);
        const { dataUri, dataSource = [] } = props;
        this.state = { loading: true, data: [] };

        if (dataUri !== "") {
            //fetch online data from dataUri
            this.fetchData(dataUri);
        } else {
            //render offline data from dataSource
            this.state = { loading: false, data: dataSource };
        }
    }

    fetchData(dataUri) {
        fetch(dataUri)
            .then(response => response.json())
            .then(json => this.setState({ loading: false, data: json }));
    }

    shouldComponentUpdate(nextProps) {

        if (nextProps.dataUri !== this.props.dataUri) {
            if (!nextProps.dataUri && this.props.dataSource) {
                this.setState({ loading: false, data: this.props.dataSource });
            } else {
                this.setState({ loading: true, data: [] }, () => this.fetchData(nextProps.dataUri));
            }
            return false;
        }

        if (nextProps.dataSource !== this.props.dataSource) {
            this.setState({ loading: false, data: this.props.dataSource });
            return false;
        }

        return true;
    }

    render() {
        if (this.state.loading) {
            const { loaderTemplate: Loader = LoaderPlaceholder, loaderText } = this.props;
            return <Loader text={loaderText} />;
        } else {
            const { dataUri, loaderTemplate, loaderText, containerTemplate: Container = "ul", itemTemplate: Item = "li", itemProps, ...other } = this.props;
            return <Container {...other}>
                       {[
                           this.state.data.map((e, index) =>
                               <Item key={index} data-source={e} data-row-id={index} {...itemProps} />)
                       ]}
                   </Container>;
        }
    }
}