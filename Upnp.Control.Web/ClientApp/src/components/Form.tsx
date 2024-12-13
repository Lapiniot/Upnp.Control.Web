import { FormEvent, FormHTMLAttributes, useCallback } from "react";
import { useNavigator } from "../hooks/Navigator";

export function Form({ onSubmit, method, action, ...props }: FormHTMLAttributes<HTMLFormElement>) {
    const { navigate } = useNavigator();
    const submit = useCallback((event: FormEvent<HTMLFormElement>) => {
        onSubmit?.(event);
        if (method?.toLowerCase() === "get" && !event.defaultPrevented) {
            event.preventDefault();
            const data = new FormData(event.target as HTMLFormElement);
            const params = new URLSearchParams();
            data.forEach((value, name) => {
                if (typeof value === "string" && value !== "") {
                    params.append(name, value);
                }
            });
            if (typeof action === "function") {
                action(data);
            }
            else {
                navigate({ pathname: action, search: params.toString() });
            }
        }
    }, [onSubmit, method, action, navigate]);
    return <form {...props} method={method} onSubmit={submit} />
}