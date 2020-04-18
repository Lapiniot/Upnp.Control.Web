export function mergeClassNames(strings, ...values) {
    return [...strings, ...values].reduce((acc, current) => {
        if (!current) return acc;
        if (acc === "") return current.trim();
        return acc + " " + current.trim();
    }, "");
}

export function reversemap(array, fn) {
    return array.reduceRight((acc, e, i) => {
        acc.push(fn(e, i));
        return acc;
    }, []);
}

const pathRegex = new RegExp(":([\\w]+)[^\/]*", "g");

export function generatePath(path, params) {
    return path.replace(pathRegex, (_, name) => {
        return params[name];
    });
}

