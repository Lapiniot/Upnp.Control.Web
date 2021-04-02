import WebApi from "./WebApi";

export default {
    subscribe: async () => {
        const reg = await navigator.serviceWorker.ready;
        if (reg) {
            const ps = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: "BOgOXy-KSALzQUxXxdkoxmtjp_MOZtzHM7G0A7zDXdgcdEqOHfZ5DEVJBHM6HcupVWV-oVSEGEC9B2pSCtv3Smw"
            });
            if (!ps) throw new Error("PushManager subscription failed");
            const response = await WebApi.notifications().subscribe(ps.endpoint, ps.getKey("p256dh"), ps.getKey("auth"), ps.expirationTime).fetch();
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
                    WebApi.notifications().unsubscribe(ps.endpoint).fetch().then(r => {
                        if (!r.ok) throw new Error(`Unsubscription request failed: HTTP ${r.status} - ${r.statusText}`);
                    }),
                    ps.unsubscribe()
                ]);
            }
        }
    }
}