import React from "react";

export function mergeClassNames(strings, ...values) {
    return [...strings, ...values].reduce((acc, current) => {
        if (!!!current) return acc;
        if (acc === "") return current.trim();
        return acc + " " + current.trim();
    },
        "");
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
            this.state = { dataUrl: null, loading: true, data: [] };
        }

        static getDerivedStateFromProps(props, state) {
            const url = dataUrlBuilder(props);
            return state.dataUrl !== url ? { dataUrl: url, loading: true, data: [] } : null;
        }

        async fetchData(url) {
            try {
                let response = await fetch(url);
                let data = await response.json();
                this.setState({ loading: false, data: data });
            }
            catch (e) {
                console.log(e);
                this.setState({ loading: false, data: [], error: e });
            }
        }

        componentDidUpdate(prevProps, prevState) {
            if (this.state.dataUrl !== prevState.dataUrl) {
                this.reload();
            }
        }

        componentDidMount() {
            this.fetchData(this.state.dataUrl);
        }

        reload = () => {
            this.setState({ loading: true, data: [] }, () => this.fetchData(this.state.dataUrl));
        }

        render() {
            if (this.state.loading) {
                const { template: Template = "div", text = "Loading..." } = loadPlaceholderProps;
                return <Template>{text}</Template>;
            } else {
                return <Component dataContext={{ source: this.state.data, reload: this.reload }} {...this.props} />;
            }
        }
    };
}