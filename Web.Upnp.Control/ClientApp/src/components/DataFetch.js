import React from "react";

export function withDataFetch(Component, loadIndicatorConfig = {}, dataUrlBuilder = props => props.dataUrl) {
    return class extends React.Component {
        constructor(props) {
            super(props);
            this.state = { loading: true, dataContext: undefined };
            const { template: Template = "div", text = "Loading...", usePreloader = true, ...other } = loadIndicatorConfig;
            this.preloader = usePreloader && <Template {...other}>{text}</Template>;
        }
        async fetchData(url) {
            try {
                const response = await window.fetch(url);
                const data = await response.json();
                this.setState({ loading: false, dataContext: { source: data, reload: () => this.load(url) } });
            }
            catch (e) {
                console.error(e);
                this.setState({ loading: false, dataContext: undefined, error: e });
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
        load = url => this.setState({ loading: true, dataContext: undefined }, () => this.fetchData(url));
        render() {
            return this.state.loading && this.preloader
                ? this.preloader
                : <Component dataContext={this.state.dataContext} {...this.props} />;
        }
    };
}