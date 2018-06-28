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
        const dataUri = props.dataUri || props["data-uri"];
        if (dataUri !== "") {
            //fetch online data from dataUri
            this.state = { loading: true, data: [] };
            fetch(dataUri).then(response => response.json())
                .then(json => this.setState({ loading: false, data: json }));
        } else {
            //render offline data from dataSource
            this.state = { loading: false, data: props.dataSource };
        }
    }

    render() {

        if (this.state.loading) {
            const Loader = this.props.loaderTemplate || LoaderPlaceholder;
            return <Loader text={this.props.loaderText}/>;
        } else {
            const Container = this.props.containerTemplate || "ul";
            const Item = this.props.itemTemplate || "li";
            return <Container {...this.props.containerProps}>
                       {[
                           this.state.data.map((e, index) =>
                               <Item data-source={e} data-id={index} {...this.props.itemProps}/>)
                       ]}
                   </Container>;
        }
    }
}