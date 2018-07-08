export class QString {
    static parse(str) {
        const reducer = (accumulator, current) => { accumulator[current[0]] = current[1]; return accumulator; };
        return (str.startsWith("?") ? str.substring(1) : str)
            .split("&")
            .map(s => s.split("="))
            .reduce(reducer, {});
    }
}