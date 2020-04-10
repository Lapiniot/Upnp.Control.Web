import React from "react";

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
            const { device, baseUrl, match: { url }, location: { search: query } } = this.props;
            const params = new window.URLSearchParams(query);
            const page = params.get("p");
            const pageSize = params.get("s");
            const context = {
                urls: { current: url, base: baseUrl, root: `${baseUrl}/${device}` },
                page: page ? parseInt(page, 10) : 1,
                pageSize: pageSize ? parseInt(pageSize, 10) : 50,
                navigateHandler: this.navigateHandler
            };

            return <Component navContext={context} {...this.props}/>;
        }
    };
}