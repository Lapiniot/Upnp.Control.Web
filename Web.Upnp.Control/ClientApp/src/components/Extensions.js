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

export function withDataFetch(Component, loadPlaceholderProps = {}, dataUrlBuilder = props => props.dataUrl) {

    return class extends React.Component {
        constructor(props) {
            super(props);
            this.state = { dataUrl: null, loading: true, dataContext: null };
            const { template: Template = "div", text = "Loading...", usePreloader = true } = loadPlaceholderProps;
            this.preloader = usePreloader && <Template>{text}</Template>;
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
                console.error(e);
                this.setState({ loading: false, dataContext: null, error: e });
            }
        }

        componentDidUpdate(_prevProps, prevState) {
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
            if (this.state.loading && this.preloader) {
                return this.preloader;
            }
            return <Component dataContext={this.state.dataContext} {...this.props} />;
        }
    };
}