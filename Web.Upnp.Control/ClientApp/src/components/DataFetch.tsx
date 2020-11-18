import React, { ComponentType, ElementType } from "react";

interface FunctionWithKey {
    (...args: any[]): any;
    key?: string;
}

type PreloaderProps = {
    template?: ElementType;
    text?: string;
    usePreloader?: boolean;
}

export type DataContext<T = {}> = {
    source: T;
    reload: () => void;
}

export type DataFetchProps<T = {}> = {
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

type DataFetchPromiseFactoryBuilder<P> = (props: P) => FunctionWithKey | undefined;

export function withDataFetch<P extends DataFetchProps<D>, D>(Component: ComponentType<P>, builder: DataFetchPromiseFactoryBuilder<Omit<P, keyof DataFetchProps<D>>>,
    { template: Template = "div", text = "Loading...", usePreloader = true }: PreloaderProps = {}) {

    type ConstructedProps = Omit<P, keyof DataFetchProps<D>>;

    return class extends React.Component<ConstructedProps, DataFetchState> {

        state = { fetching: true, dataContext: null, fetchPromiseFactory: null, error: null }

        preloader = usePreloader && <Template>{text}</Template>;

        static getDerivedStateFromProps(props: ConstructedProps, state: DataFetchState) {
            const promiseFactory = builder(props);
            const fromStatePromiseFactory = state.fetchPromiseFactory;
            const shouldFetchNewData = ((!promiseFactory?.key || !fromStatePromiseFactory?.key) && fromStatePromiseFactory !== promiseFactory)
                || promiseFactory.key !== fromStatePromiseFactory.key;

            return shouldFetchNewData
                ? { fetchPromiseFactory: promiseFactory, fetching: true, error: null }
                : null;
        }

        async fetchData() {
            const fetch = this.state.fetchPromiseFactory;
            if (fetch) {
                try {
                    const data = await (fetch as () => Promise<D>)();
                    this.setState({ fetching: false, dataContext: { source: data, reload: this.reload }, error: null });
                } catch (e) {
                    console.error(e);
                    this.setState({ fetching: false, error: e });
                }
            }
        }

        componentDidUpdate(_: ConstructedProps, prevState: DataFetchState) {
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
                : <Component {...(this.props as unknown as P)} dataContext={this.state.dataContext} fetching={this.state.fetching} error={this.state.error} />;
        }
    };
}