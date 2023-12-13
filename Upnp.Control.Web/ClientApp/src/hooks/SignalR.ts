import { useContext, useEffect, useRef } from "react";
import { SignalRContext } from "../components/SignalRConnection";

export function useSignalR(callbacks: Record<string, { (...args: any): void; }>) {
    const connection = useContext(SignalRContext);
    const prevCallbacksRef = useRef<typeof callbacks>();

    useEffect(() => {
        if (prevCallbacksRef.current) {
            Object.entries(prevCallbacksRef.current).forEach(([name, fn]) => connection?.off(name, fn));
        }

        Object.entries(callbacks).forEach(([name, fn]) => connection?.on(name, fn));

        prevCallbacksRef.current = callbacks;

        return () => {
            if (prevCallbacksRef.current) {
                Object.entries(prevCallbacksRef.current).forEach(([name, fn]) => connection?.off(name, fn));
            }
        }
    }, [connection, callbacks]);
}