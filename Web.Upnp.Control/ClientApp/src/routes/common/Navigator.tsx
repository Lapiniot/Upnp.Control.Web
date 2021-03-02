import React, { ComponentType } from "react";
import { RouteComponentProps } from "react-router";
import { generatePath } from "../../components/Extensions";

export type NavigatorProps = { navigate: (data: { [key: string]: string | undefined }) => void }

type InjectedProps<Params> = NavigatorProps & Params;

export default function withNavigator<P extends InjectedProps<Params>, Params extends { [K in keyof Params]?: any }>(Component: ComponentType<P>) {

    type ConstructedProps = Omit<P, keyof InjectedProps<Params>> & RouteComponentProps<Params>;

    return class extends React.Component<ConstructedProps> {

        navigate = (data: { [key: string]: string | undefined }, template?: string) => {
            const { match: { path, params }, history } = this.props;
            history.push(generatePath(template ?? path, { ...params, ...data }));
        }

        render() {
            const { location: { search }, match: { params: { ...params } } } = this.props;
            new window.URLSearchParams(search).forEach((value, key) => params[key] = value);
            return <Component {...(this.props as unknown as P)} {...params} navigate={this.navigate} />;
        }
    };
}