export default class {
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

    static build(query) {
        const str = Object
            .entries(query)
            .map(p => encodeURIComponent(p[0]) + "=" + encodeURIComponent(p[1]))
            .join("&");
        return str.length > 0 ? `?${str}` : str;
    }
}