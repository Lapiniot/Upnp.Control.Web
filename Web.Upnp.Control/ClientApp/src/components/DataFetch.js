import React from "react";

export function withMemoKey(func, key) {
    let wrapper = (...args) => func(...args);
    wrapper.key = key;
    return wrapper;
}

const defaultFetchBuilder = (dataUrl) => (withMemoKey(() => window.fetch(dataUrl), dataUrl));

export function withDataFetch(Component, fetchPromiseFactoryBuilder = defaultFetchBuilder,
    { template: Template = "div", text = "Loading...", usePreloader = true, ...other } = {}) {

    return class extends React.Component {
        constructor(props) {
            super(props);
            this.state = { fetching: true, dataContext: null, fetchPromiseFactory: null };
            this.preloader = usePreloader && <Template {...other}>{text}</Template>;
        }

        static getDerivedStateFromProps(props, state) {
            const promiseFactory = fetchPromiseFactoryBuilder(props);
            const fromStatePromiseFactory = state.fetchPromiseFactory;
            const shouldFetchNewData = ((!promiseFactory?.key || !fromStatePromiseFactory?.key) && fromStatePromiseFactory !== promiseFactory)
                || promiseFactory.key !== fromStatePromiseFactory.key;

            return shouldFetchNewData
                ? { fetchPromiseFactory: promiseFactory, fetching: true, error: null }
                : null;
        }

        async fetchData() {
            try {
                const response = await this.state.fetchPromiseFactory();
                const data = await response.json();
                this.setState({ fetching: false, dataContext: { source: data, reload: this.reload }, error: null });
            } catch (e) {
                console.error(e);
                this.setState({ fetching: false, error: e });
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

        reload = () => this.setState({ fetching: true, error: null }, this.fetchData);

        render() {
            return this.state.fetching && this.preloader
                ? this.preloader
                : <Component dataContext={this.state.dataContext} {...this.props} fetching={this.state.fetching} error={this.state.error} />;
        }
    };
}