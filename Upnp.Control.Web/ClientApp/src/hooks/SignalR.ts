import { SignalRContext } from "@components/SignalRContext";
import { useContext, useEffect } from "react";

export function useSignalR<T extends unknown[]>(callbacks: Record<string, (...args: T) => void>) {
    const connection = useContext(SignalRContext);

    useEffect(function () {
        if (connection && callbacks) {
            Object.entries(callbacks).forEach(([name, fn]) => connection.on(name, fn));

            return () => {
                Object.entries(callbacks).forEach(([name, fn]) => connection.off(name, fn));
            }
        }
    }, [connection, callbacks]);
}