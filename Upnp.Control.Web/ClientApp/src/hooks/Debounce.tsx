import { useMemo } from "react";
import { debounce } from "../services/Extensions";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDebounce<F extends (...args: any[]) => unknown>(fn?: F, delay: number = 500) {
    return useMemo(() => fn && debounce(fn, delay), [fn, delay]);
}