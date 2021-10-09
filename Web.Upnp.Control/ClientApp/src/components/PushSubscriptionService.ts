import WebApi, { NotificationType } from "./WebApi";

export default {
    subscribe: async () => {
        const reg = await navigator.serviceWorker.ready;
        if (reg) {
            const key = await (await WebApi.notifications().serverKey().fetch()).arrayBuffer();
            const ps = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: key
            });
            if (!ps) throw new Error("PushManager subscription failed");
            const response = await WebApi.notifications().subscribe(ps.endpoint, NotificationType.DeviceDiscovery, ps.getKey("p256dh"), ps.getKey("auth")).fetch();
            if (!response.ok) {
                throw new Error(`Subscription request failed: HTTP ${response.status} - ${response.statusText}`);
            }
        }
    },
    unsubscribe: async () => {
        const reg = await navigator.serviceWorker.ready;
        if (reg) {
            const ps = await reg.pushManager.getSubscription();
            if (ps) {
                await Promise.all([
                    WebApi.notifications().unsubscribe(ps.endpoint, NotificationType.DeviceDiscovery).fetch().then(r => {
                        if (!r.ok) throw new Error(`Unsubscription request failed: HTTP ${r.status} - ${r.statusText}`);
                    }),
                    ps.unsubscribe()
                ]);
            }
        }
    },
    isSubscribed: async () => {
        const reg = await navigator.serviceWorker.ready;
        return reg && (await reg.pushManager.getSubscription()) !== null;
    }
}