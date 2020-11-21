import React, { ComponentType, EventHandler, UIEvent } from "react";
import { RouteComponentProps } from "react-router";
import { generatePath } from "../../components/Extensions";

export type NavigatorProps = { navigate: EventHandler<UIEvent<HTMLElement>> }

type InjectedProps<Params> = NavigatorProps & Params;

export default function withNavigator<Params extends { [K in keyof Params]?: any }, P extends InjectedProps<Params> = any>(Component: ComponentType<P>) {

    type ConstructedProps = Omit<P, keyof InjectedProps<Params>> & RouteComponentProps<Params>;

    return class extends React.Component<ConstructedProps> {

        navigateHandler: EventHandler<UIEvent<HTMLElement>> = ({ currentTarget: { dataset } }) => {
            this.navigateToItem(dataset);
        }

        navigateToItem = (data: DOMStringMap) => {
            const { match: { path, params }, history } = this.props;
            history.push(generatePath(path, { ...params, ...data }));
        }

        render() {
            const { location: { search }, match: { params: { ...params } } } = this.props;
            new window.URLSearchParams(search).forEach((value, key) => params[key] = value);
            return <Component {...(this.props as unknown as P)} {...params} navigate={this.navigateHandler} />;
        }
    };
}