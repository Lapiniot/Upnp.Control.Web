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
    return array.reduceRight((acc, e, i) => {
        acc.push(fn(e, i));
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

export function withDataFetch(Component, loadPlaceholderProps = {}, dataUrlBuilder = props => props.dataUrl) {

    return class extends React.Component {
        constructor(props) {
            super(props);
            const url = dataUrlBuilder(props);
            this.state = { loading: true, data: [] };

            if (!!url) {
                //fetch online data from dataUri
                this.fetchData(url);
            }
        }

        fetchData(url) {
            fetch(url)
                .then(response => response.json())
                .then(json => (this.props.onDataReady || (j => j))(json))
                .then(data => this.setState({ loading: false, data: data }));
        }

        shouldComponentUpdate(nextProps) {
            const current = dataUrlBuilder(this.props);
            const next = dataUrlBuilder(nextProps);
            if (next !== current) {
                this.setState({ loading: true, data: [] }, () => this.fetchData(next));
                return false;
            }
            return true;
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