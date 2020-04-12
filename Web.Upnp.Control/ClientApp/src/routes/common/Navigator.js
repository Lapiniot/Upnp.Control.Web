import React from "react";
import { generatePath } from "react-router";

export default function (Component) {
    return class extends React.Component {
        navigateHandler = ({ currentTarget: { dataset } }) => {
            this.navigateToItem(dataset);
        }

        navigateToItem = (data) => {
            const { match: { path, params }, history } = this.props;
            history.push(generatePath(path, { ...params, ...data }));
        }

        render() {
            const { location: { search }, match: { params: { ...params } } } = this.props;
            new window.URLSearchParams(search).forEach((value, key) => params[key] = value);
            return <Component navigate={this.navigateHandler} {...this.props} {...params} />;
        }
    };
}