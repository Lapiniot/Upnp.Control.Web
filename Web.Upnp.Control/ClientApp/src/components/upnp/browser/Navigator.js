import React from "react";
import { QString } from "../../Extensions";

export function withNavigationContext(Component) {
    return class extends React.Component {

        displayName = withNavigationContext.name + "(" + Component.name + ")";

        navigateHandler = event => {
            const id = event.currentTarget.dataset.id;
            this.navigateToItem(id);
        }

        navigateTo = (location) => {
            this.props.history.push(location);
        }

        navigateToItem = (id) => {
            if (id !== "-1")
                this.navigateTo(`${this.props.baseUrl}/${this.props.device}/${id}`);
            else
                this.navigateTo(this.props.baseUrl);
        }

        render() {
            const { device, baseUrl, match: { url }, location: { search: qstring } } = this.props;
            const { p: page = 1, s: size = 50 } = QString.parse(qstring);
            const context = {
                urls: { current: url, base: baseUrl, root: `${baseUrl}/${device}` },
                page: parseInt(page),
                size: parseInt(size),
                navigateHandler: this.navigateHandler
            };

            return <Component context={context} {...this.props} />;
        }
    };
}