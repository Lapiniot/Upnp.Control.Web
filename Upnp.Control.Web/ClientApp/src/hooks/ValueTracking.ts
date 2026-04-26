import { useState } from "react";

export function useValueTracking<T>(value: T): T {
    const [prevValue, setValue] = useState(value);

    if (prevValue !== value) {
        setValue(value);
    }

    return prevValue;
}