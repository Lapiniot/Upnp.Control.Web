import { useRef } from "react";

export function useValueTracking<T>(value: T): boolean {
    const valueRef = useRef(value);

    // eslint-disable-next-line react-hooks/refs
    if (valueRef.current !== value) {
        // eslint-disable-next-line react-hooks/refs
        valueRef.current = value;
        return true;
    }

    return false;
}