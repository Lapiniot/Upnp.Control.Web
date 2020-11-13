import React, { ElementType, EventHandler, UIEvent } from "react";
import { RouteComponentProps } from "react-router";
import { generatePath } from "../../components/Extensions";

export default function (Component: ElementType) {
    return class extends React.Component<RouteComponentProps<{ [key: string]: string }>> {
        navigateHandler: EventHandler<UIEvent<HTMLElement>> = ({ currentTarget: { dataset } }) => {
            this.navigateToItem(dataset);
        }

        navigateToItem = (data: {}) => {
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