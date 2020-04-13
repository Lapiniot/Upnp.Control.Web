import React from "react";

export function withDataFetch(Component, loadIndicatorConfig = {}, dataUrlBuilder = props => props.dataUrl) {
    return class extends React.Component {
        constructor(props) {
            super(props);
            this.state = { loading: true, dataContext: null, dataUrl: null };
            const { template: Template = "div", text = "Loading...", usePreloader = true, ...other } = loadIndicatorConfig;
            this.preloader = usePreloader && <Template {...other}>{text}</Template>;
        }

        static getDerivedStateFromProps(props, state) {
            const dataUrl = dataUrlBuilder(props);
            return state.dataUrl !== dataUrl
                ? { dataUrl, dataContext: null, loading: true, error: null }
                : null;
        }

        async fetchData() {
            try {
                const response = await window.fetch(this.state.dataUrl);
                const data = await response.json();
                this.setState({ loading: false, dataContext: { source: data, reload: this.reload }, error: null });
            }
            catch (e) {
                console.error(e);
                this.setState({ loading: false, dataContext: null, error: e });
            }
        }

        componentDidUpdate(_, prevState) {
            if (prevState.dataUrl !== this.state.dataUrl) {
                this.fetchData();
            }
        }

        componentDidMount() {
            this.fetchData();
        }

        reload() {
            return this.setState({ loading: true, dataContext: null }, this.fetchData);
        }

        render() {
            return this.state.loading && this.preloader
                ? this.preloader
                : <Component dataContext={this.state.dataContext} {...this.props} loading={this.state.loading} error={this.state.error} />;
        }
    };
}