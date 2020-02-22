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

export function withProps(Component, props = {}) {
    return class extends React.Component {
        render() {
            return <Component {...props} {...this.props} />;
        }
    };
}

export function withMatchProps(Component, extra = {}) {
    return function ({ match: { params } = {} }) {
        return <Component {...params} {...extra} />
    }
}

export function withDataFetch(Component, loadPlaceholderProps = {}, dataUrlBuilder = props => props.dataUrl) {

    return class extends React.Component {
        constructor(props) {
            super(props);
            this.state = { dataUrl: null, loading: true, dataContext: null };
        }

        static getDerivedStateFromProps(props, state) {
            const url = dataUrlBuilder(props);
            return state.dataUrl !== url ? { dataUrl: url, loading: true, dataContext: null } : null;
        }

        async fetchData(url) {
            try {
                const response = await fetch(url);
                const data = await response.json();
                this.setState({ loading: false, dataContext: { source: data, reload: this.reload } });
            } catch (e) {
                console.log(e);
                this.setState({ loading: false, dataContext: null, error: e });
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
            this.setState({ loading: true, dataContext: null }, () => this.fetchData(this.state.dataUrl));
        }

        render() {
            if (this.state.loading) {
                const { template: Template = "div", text = "Loading..." } = loadPlaceholderProps;
                return <Template>{text}</Template>;
            } else {
                return <Component dataContext={this.state.dataContext} {...this.props} />;
            }
        }
    };
}