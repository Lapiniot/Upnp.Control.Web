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

type ReloadFunc<T> = (action?: (() => Promise<any>) | null, state?: {}) => Promise<T>;

export type DataContext<T = {}> = {
    source: T;
    reload: ReloadFunc<T>;
}

export type DataFetchProps<T = {}> = {
    dataContext: DataContext<T> | null;
    fetching: boolean;
    error: Error | null;
}

type DataFetchState = {
    fetching: boolean;
    dataContext: DataContext | null;
    fetch: FunctionWithKey | null;
    error: Error | null;
}

export function withMemoKey(func: (...args: any[]) => any, key: string) {
    let wrapper: FunctionWithKey = (...args: any[]) => func(...args);
    wrapper.key = key;
    return wrapper;
}

export function withDataFetch<P extends DataFetchProps<T>, Params = {}, T = {}>(Component: ComponentType<P>,
    builder: (props: Omit<P, keyof DataFetchProps> & Params) => FunctionWithKey | null,
    { template: Template = "div", text = "Loading...", usePreloader = true }: PreloaderProps = {}) {

    type ConstructedProps = Omit<P, keyof DataFetchProps> & Params;

    return class extends React.Component<ConstructedProps, DataFetchState> {

        preloader = usePreloader && <Template>{text}</Template>;

        constructor(props: ConstructedProps) {
            super(props);
            this.state = { fetching: true, dataContext: null, fetch: builder(props), error: null }
        }

        fetchData = async () => {
            const fetch = this.state.fetch;

            if (!fetch) return;

            try {
                const data = await fetch();
                this.setState({ fetching: false, dataContext: { source: data, reload: this.reload }, error: null });
                return data;
            } catch (e) {
                console.error(e);
                this.setState({ fetching: false, error: e });
                throw e;
            }
        }

        componentDidUpdate() {
            const fetch = builder(this.props as ConstructedProps);

            if (!fetch) return;

            const fromStateFetch = this.state.fetch;

            if (((!fetch.key || !fromStateFetch?.key) && (fetch !== fromStateFetch)) || (fetch.key !== fromStateFetch?.key)) {
                this.setState({ fetching: true, error: null, fetch: fetch }, this.fetchData);
            }
        }

        componentDidMount() {
            this.fetchData();
        }

        reload: ReloadFunc<T> = (action?: (() => Promise<any>) | null, state?: {}) => {
            return new Promise<T>((resolve, reject) =>
                this.setState({ fetching: true, error: null, ...state },
                    () => (action ? action().then(this.fetchData) : this.fetchData())
                        .then(resolve)
                        .catch(reject)
                )
            );
        }

        render() {
            return this.state.fetching && this.preloader
                ? this.preloader
                : <Component {...(this.props as unknown as P)} dataContext={this.state.dataContext} fetching={this.state.fetching} error={this.state.error} />;
        }
    };
}