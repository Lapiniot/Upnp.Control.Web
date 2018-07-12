import React from "react";

export class QString {
    static parse(str) {
        const reducer = (accumulator, current) => {
            accumulator[current[0]] = current[1];
            return accumulator;
        };
        return (str.startsWith("?") ? str.substring(1) : str)
            .split("&")
            .map(s => s.split("="))
            .reduce(reducer, {});
    }
}

export function reversemap(array, fn) {
    return array.reduceRight((acc, e) => {
            acc.push(fn(e));
            return acc;
        },
        []);
}

export function withProps(Component, props = {}) {
    return class ComponentWithExtraProps extends React.Component {
        render() {
            return <Component {...props} {...this.props} />;
        }
    };
}

export function renderWithProps(Component, props = {}) {
    return () => <Component {...props} {...this.props} />;
}