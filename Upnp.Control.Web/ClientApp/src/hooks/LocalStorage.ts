import { useCallback } from "react";

export function useLocalStorage(key: string): [string | null, (value: string | null) => void] {
    const value = localStorage.getItem(key);
    const setter = useCallback((value: string | null) => {
        if (value)
            localStorage.setItem(key, value);

        else
            localStorage.removeItem(key);
    }, [key]);
    return [value, setter];
}