import React from "react";

export function withMemoKey(func, key) {
    let wrapper = (...args) => func(...args);
    wrapper.key = key;
    return wrapper;
}

const defaultFetchBuilder = (dataUrl) => (withMemoKey(() => window.fetch(dataUrl), dataUrl));

export function withDataFetch(Component, loadIndicatorConfig = {}, fetchPromiseFactoryBuilder = defaultFetchBuilder) {
    return class extends React.Component {
        constructor(props) {
            super(props);
            this.state = { loading: true, dataContext: null, fetchPromiseFactory: null };
            const { template: Template = "div", text = "Loading...", usePreloader = true, ...other } = loadIndicatorConfig;
            this.preloader = usePreloader && <Template {...other}>{text}</Template>;
        }

        static getDerivedStateFromProps(props, state) {
            const promiseFactory = fetchPromiseFactoryBuilder(props);
            const fromStatePromiseFactory = state.fetchPromiseFactory;
            const shouldFetchNewData = ((!promiseFactory?.key || !fromStatePromiseFactory?.key) && fromStatePromiseFactory !== promiseFactory)
                || promiseFactory.key !== fromStatePromiseFactory.key;

            return shouldFetchNewData
                ? { fetchPromiseFactory: promiseFactory, dataContext: null, loading: true, error: null }
                : null;
        }

        async fetchData() {
            try {
                const response = await this.state.fetchPromiseFactory();
                const data = await response.json();
                this.setState({ loading: false, dataContext: { source: data, reload: this.reload }, error: null });
            } catch (e) {
                console.error(e);
                this.setState({ loading: false, dataContext: null, error: e });
            }
        }

        componentDidUpdate(_, prevState) {
            if (prevState.fetchPromiseFactory !== this.state.fetchPromiseFactory) {
                this.fetchData();
            }
        }

        componentDidMount() {
            this.fetchData();
        }

        reload = () => this.setState({ loading: true, dataContext: null }, this.fetchData);

        render() {
            return this.state.loading && this.preloader
                ? this.preloader
                : <Component dataContext={this.state.dataContext} {...this.props} loading={this.state.loading} error={this.state.error} />;
        }
    };
}