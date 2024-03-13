import { useContext, useEffect, useRef } from "react";
import { SignalRContext } from "../components/SignalRConnection";

export function useSignalR<T extends unknown[]>(callbacks: Record<string, (...args: T)=> void>) {
    const connection = useContext(SignalRContext);
    const prevRef = useRef<{ connection: typeof connection, callbacks: typeof callbacks }>();

    useEffect(function () {
        cleanup();
        if (connection && callbacks) {
            Object.entries(callbacks).forEach(([name, fn]) => connection.on(name, fn));
        }
        prevRef.current = { connection, callbacks };
        return cleanup;

        function cleanup() {
            if (prevRef.current?.callbacks && prevRef.current.connection) {
                const { connection: prevConnection, callbacks: prevCallbacks } = prevRef.current;
                Object.entries(prevCallbacks).forEach(([name, fn]) => prevConnection.off(name, fn));
            }
        }
    }, [connection, callbacks]);
}