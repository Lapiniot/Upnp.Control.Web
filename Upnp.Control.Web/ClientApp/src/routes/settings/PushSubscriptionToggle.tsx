import { InputHTMLAttributes, useCallback, useEffect, useState } from "react";
import { FlagEditor } from "../../components/editors/FlagEditor";
import PushSubService from "../../components/PushSubscriptionService";
import { PushNotificationType } from "../../components/WebApi";

type PushSubscriptionToggleProps = InputHTMLAttributes<HTMLInputElement> & {
    notificationType: PushNotificationType
};

export function PushSubscriptionToggle({ disabled: disabledProp, notificationType: type, ...other }: PushSubscriptionToggleProps) {
    const [value, setValue] = useState(false);
    const [disabled, setDisabled] = useState(disabledProp);

    const callback = useCallback((subscribe: boolean) => {
        setDisabled(true);
        if (subscribe) {
            Notification.requestPermission().then(v => {
                if (v === "granted") {
                    return PushSubService.subscribe(type);
                }
            }).then(() => setDisabled(undefined));
        } else {
            PushSubService.unsubscribe(type).then(() => setDisabled(undefined));
        }
    }, []);

    useEffect(() => { PushSubService.isSubscribed(type).then(v => setValue(v)); }, [type]);
    useEffect(() => { setDisabled(disabledProp); }, [disabledProp]);

    return <FlagEditor {...other} checked={value} disabled={disabled} callback={callback} />;
}