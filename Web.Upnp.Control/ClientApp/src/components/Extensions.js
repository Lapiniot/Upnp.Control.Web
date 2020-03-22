import React from "react";

export function mergeClassNames(strings, ...values) {
    return [...strings, ...values].reduce((acc, current) => {
        if (!current) return acc;
        if (acc === "") return current.trim();
        return acc + " " + current.trim();
    }, "");
}

export function reversemap(array, fn) {
    return array.reduceRight((acc, e, i) => {
        acc.push(fn(e, i));
        return acc;
    }, []);
}

export function withProps(Component, extra = {}) {
    return (props) => <Component {...extra} {...props} />;
}

export function withMatchProps(Component, extra = {}) {
    return ({ match: { params } = {}, ...other }) => <Component {...params} {...extra} {...other} />
}

export function withDataFetch(Component, loadIndicatorConfig = {}, dataUrlBuilder = props => props.dataUrl) {
    return class extends React.Component {
        constructor(props) {
            super(props);
            this.state = { loading: true, dataContext: null };
            const { template: Template = "div", text = "Loading...", usePreloader = true, ...other } = loadIndicatorConfig;
            this.preloader = usePreloader && <Template {...other}>{text}</Template>;
        }

        async fetchData(url) {
            try {
                const response = await fetch(url);
                const data = await response.json();
                this.setState({ loading: false, dataContext: { source: data, reload: () => this.load(url) } });
            } catch (e) {
                console.error(e);
                this.setState({ loading: false, dataContext: null, error: e });
            }
        }

        componentDidUpdate(prevProps) {
            const previous = dataUrlBuilder(prevProps);
            const current = dataUrlBuilder(this.props);
            if (previous !== current) {
                this.load(current);
            }
        }

        componentDidMount() {
            this.fetchData(dataUrlBuilder(this.props));
        }

        load = url => this.setState({ loading: true, dataContext: null }, () => this.fetchData(url));

        render() {
            return this.state.loading && this.preloader
                ? this.preloader
                : <Component dataContext={this.state.dataContext} {...this.props} />;
        }
    };
}