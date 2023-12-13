import { useCallback, useEffect, useState } from "react";
import { PushNotificationType } from "../services/WebApi";
import PushSubService from "../services/PushSubscriptionService";

async function fetchPushSubState(): Promise<[type: number, valid: boolean]> {
    const [state, validation] = await Promise.allSettled([PushSubService.state(), PushSubService.validate()]);
    return [
        state.status === "fulfilled" ? state.value : PushNotificationType.None,
        validation.status === "fulfilled" ? validation.value : false
    ];
}

type PushSubscriptionState = {
    types: PushNotificationType,
    valid: boolean,
    loading: boolean,
    toggle(subscribe: boolean, type: PushNotificationType): void,
    reset(): void
}

const initialState = { types: PushNotificationType.None, valid: true, loading: false }

export function usePushSubscription(): PushSubscriptionState {
    const [{ types, valid, loading, }, setState] = useState(initialState);

    const toggle = useCallback((enable: boolean, value: PushNotificationType) => {
        setState(current => ({ ...current, loading: true }));
        (enable ?
            Notification.requestPermission().then(permission => {
                if (permission === "granted")
                    return PushSubService.subscribe(value);
                else
                    return Promise.reject(new Error("No permission granted by user."));
            }) :
            PushSubService.unsubscribe(value)).then(
                () => setState(current => ({ ...current, types: current.types ^ value, loading: false })),
                () => setState(current => ({ ...current, loading: false })));
    }, []);

    const reset = useCallback(() => {
        setState(current => ({ ...current, loading: true }));
        PushSubService.fixup(types).then(
            () => setState(current => ({ ...current, valid: true, loading: false })),
            () => setState(current => ({ ...current, loading: false })));
    }, [types]);

    useEffect(() => {
        setState(current => ({ ...current, loading: true }));
        fetchPushSubState().then(
            ([types, valid]) => setState(current => ({ ...current, types, valid, loading: false })),
            () => setState(current => ({ ...current, loading: false })));
    }, []);

    return { types, valid, loading, reset, toggle }
}