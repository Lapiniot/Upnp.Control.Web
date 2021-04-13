import { FlagEditor } from "../../components/editors/FlagEditor";
import { InputHTMLAttributes, useCallback, useEffect, useState } from "react";
import PushSubService from "../../components/PushSubscriptionService";

export function PushSubscriptionToggle({ disabled: disabledProp, checked: checkedProp, ...other }: InputHTMLAttributes<HTMLInputElement>) {
    const [value, setValue] = useState(checkedProp);
    const [disabled, setDisabled] = useState(disabledProp);

    const callback = useCallback((subscribe) => {
        setDisabled(true);
        PushSubService.unsubscribe()
            .then(() => {
                if (subscribe) {
                    Notification.requestPermission().then(v => {
                        if (v === "granted") {
                            return PushSubService.subscribe();
                        }
                    })
                }
            })
            .then(() => setDisabled(undefined));
    }, []);

    useEffect(() => { PushSubService.isSubscribed().then(v => setValue(v)); }, []);
    useEffect(() => { setDisabled(disabledProp); }, [disabledProp]);

    return <FlagEditor {...other} checked={value} disabled={disabled} callback={callback} />;
}