import WebApi, { NotificationType } from "./WebApi";

export default {
    subscribe: async (type: NotificationType) => {
        const reg = await navigator.serviceWorker.ready;
        if (reg) {
            const ps = await reg.pushManager.getSubscription()
                ?? await reg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: await (await WebApi.notifications().serverKey().fetch()).arrayBuffer()
                });
            if (!ps) throw new Error("PushManager subscription failed");
            const response = await WebApi.notifications().subscribe(ps.endpoint, type, ps.getKey("p256dh"), ps.getKey("auth")).fetch();
            if (!response.ok) {
                throw new Error(`Subscription request failed: HTTP ${response.status} - ${response.statusText}`);
            }
        }
    },
    unsubscribe: async (type: NotificationType) => {
        const reg = await navigator.serviceWorker.ready;
        if (reg) {
            const ps = await reg.pushManager.getSubscription();
            if (ps) {
                const response = await WebApi.notifications().unsubscribe(ps.endpoint, type).fetch();
                if (!response.ok) {
                    throw new Error(`Unsubscription request failed: HTTP ${response.status} - ${response.statusText}`);
                }
            }
        }
    },
    isSubscribed: async (type: NotificationType): Promise<boolean | undefined> => {
        const reg = await navigator.serviceWorker.ready;
        if (!reg) return undefined;
        const subscription = await reg.pushManager.getSubscription();
        return !!subscription && (await WebApi.notifications().subscribed(subscription.endpoint, type).json() == true);
    }
}