export function reversemap<T, R>(array: T[], fn: (currentValue: T, index: number) => R): R[] {
    return array.reduceRight((acc, element, index) => {
        acc.push(fn(element, index));
        return acc;
    }, new Array<R>());
}

const pathRegex = new RegExp(":([\\w]+)[^/]*", "g");

export function generatePath<Params extends { [K in keyof any]: any }>(path: string, params: Params): string {
    return path.replace(pathRegex, (_, name) => params[name]);
}

export function parseMilliseconds(time: string): number {
    return new Date(`1970-01-01T${time}Z`).getTime();
}

export function formatTime(seconds: number): string {
    let h = Math.floor(seconds / 3600);
    let m = Math.floor((seconds % 3600) / 60);
    let s = (seconds % 3600) % 60;
    return h > 0
        ? `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
        : `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}