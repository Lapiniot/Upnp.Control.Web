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
        if (dataUri !== "") {
            //fetch online data from dataUri
            this.fetchData(dataUri, true);
        } else {
            //render offline data from dataSource
            this.state = { loading: false, data: dataSource };
        }
    }

    fetchData(dataUri, initial = false) {
        const newState = { loading: true, data: [] };

        if (initial)
            this.state = newState;
        else
            this.setState(newState);

        fetch(dataUri)
            .then(response => response.json())
            .then(json => this.setState({ loading: false, data: json }));
    }

    shouldComponentUpdate(nextProps) {
        if(nextProps.dataUri !== this.props.dataUri)
            this.fetchData(nextProps.dataUri);
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