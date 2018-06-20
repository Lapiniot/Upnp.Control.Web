import React from "react";
import Spinner from "./Spinner";

export default class DataView extends React.Component {

    displayName = DataView.name;

    constructor(props) {
        super(props);
        this.state = { loading: true, data: [] };
        fetch(props.dataUri || props["data-uri"]).then(response => response.json())
            .then(json => this.setState({ loading: false, data: json }));
    }

    render() {

        if (this.state.loading) {
            return <div className="d-flex-fill-center">
                <Spinner>Loading...</Spinner>
            </div>;
        } else {
            const Container = this.props.containerTemplate || "ul";
            const Item = this.props.itemTemplate || "li";
            return <Container>
                {[this.state.data.map((e, index) => <Item data={e} data-id={index} />)]}
            </Container>;
        }
    }
}