import React, { ElementType } from "react";

interface FunctionWithKey {
    (...args: any[]): any;
    key?: string;
}

type DataFetchParams = {
    template?: ElementType;
    text?: string;
    usePreloader?: boolean;
}

export type DataContext<T = {}> = {
    source: T;
    reload: () => void;
}

export type DataFetchProps<T = {}, P = {}> = P & {
    dataContext: DataContext<T> | null;
    fetching: boolean;
    error: Error | null;
}

type DataFetchState = {
    fetching: boolean;
    dataContext: DataContext | null;
    fetchPromiseFactory: FunctionWithKey | null;
    error: Error | null;
}

export function withMemoKey(func: (...args: any[]) => any, key: string) {
    let wrapper: FunctionWithKey = (...args: any[]) => func(...args);
    wrapper.key = key;
    return wrapper;
}

type DataFetchPromiseFactoryBuilder<Props> = (props: Props) => FunctionWithKey;

export function withDataFetch<Props, T = {}>(Component: ElementType<DataFetchProps<T>>, builder: DataFetchPromiseFactoryBuilder<Props>,
    { template: Template = "div", text = "Loading...", usePreloader = true, ...other }: DataFetchParams = {}): ElementType<Props> {

    return class extends React.Component<Props, DataFetchState> {

        state = { fetching: true, dataContext: null, fetchPromiseFactory: null, error: null }

        preloader = usePreloader && <Template {...other}>{text}</Template>;

        static getDerivedStateFromProps(props: Props, state: DataFetchState) {
            const promiseFactory = builder(props);
            const fromStatePromiseFactory = state.fetchPromiseFactory;
            const shouldFetchNewData = ((!promiseFactory?.key || !fromStatePromiseFactory?.key) && fromStatePromiseFactory !== promiseFactory)
                || promiseFactory.key !== fromStatePromiseFactory.key;

            return shouldFetchNewData
                ? { fetchPromiseFactory: promiseFactory, fetching: true, error: null }
                : null;
        }

        async fetchData() {
            const fetch: FunctionWithKey = this.state.fetchPromiseFactory as unknown as FunctionWithKey;
            if (fetch) {
                try {
                    const response = await fetch();
                    const data = await response.json();
                    this.setState({ fetching: false, dataContext: { source: data, reload: this.reload }, error: null });
                } catch (e) {
                    console.error(e);
                    this.setState({ fetching: false, error: e });
                }
            }
        }

        componentDidUpdate(_: any, prevState: DataFetchState) {
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
                : <Component {...this.props} dataContext={this.state.dataContext} fetching={this.state.fetching} error={this.state.error} />;
        }
    };
}