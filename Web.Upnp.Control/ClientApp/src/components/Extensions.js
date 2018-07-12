import React from "react";

export class QString {
    static parse(str) {
        const reducer = (accumulator, current) => {
            accumulator[current[0]] = current[1];
            return accumulator;
        };
        return (str.startsWith("?") ? str.substring(1) : str)
            .split("&")
            .map(s => s.split("="))
            .reduce(reducer, {});
    }
}

export function reversemap(array, fn) {
    return array.reduceRight((acc, e) => {
            acc.push(fn(e));
            return acc;
        },
        []);
}

export function withProps(Component, props = {}) {
    return class extends React.Component {
        render() {
            return <Component {...props} {...this.props} />;
        }
    };
}

export function renderWithProps(Component, props = {}) {
    return () => <Component {...props} {...this.props} />;
}

export function withDataFetch(Component, url, loadPlaceholderProps = {}) {

    return class extends React.Component {
        constructor(props) {
            super(props);
            this.state = { loading: true, data: [] };
            this.fetchData(url);
        }

        fetchData(dataUri) {
            fetch(dataUri)
                .then(response => response.json())
                .then(json => this.setState({ loading: false, data: json }));
        }

        render() {
            if (this.state.loading) {
                const { template: Template = "div", text = "Loading..." } = loadPlaceholderProps;
                return <Template>{text}</Template>;
            } else {
                return <Component dataContext={this.state.data} {...this.props} />;
            }
        }
    };
}