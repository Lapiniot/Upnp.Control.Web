import WebApi, { PushNotificationSubscriptionState, PushNotificationType } from "./WebApi";

async function getPushManager() {
    return (await navigator.serviceWorker.ready)?.pushManager;
}

async function getSubscription() {
    const manager = await getPushManager();
    return manager ? await manager.getSubscription() : null;
}

async function fetchServerPublicKey() {
    const response = await WebApi.notifications().serverKey().fetch();
    return response.ok ? response.arrayBuffer() : Promise.reject(Error("Cannot fetch application server public key."));
}

export default {
    subscribe: async (types: PushNotificationType) => {
        const pushManager = await getPushManager();
        if (pushManager) {
            const subscription = await pushManager.getSubscription()
                ?? await pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: await fetchServerPublicKey()
                });
            if (!subscription) throw new Error("PushManager subscription failed");
            const response = await WebApi.notifications().subscribe(subscription.endpoint, types, subscription.getKey("p256dh"), subscription.getKey("auth")).fetch();
            if (!response.ok) {
                throw new Error(`Subscription request failed: HTTP ${response.status} - ${response.statusText}`);
            }
        }
    },
    unsubscribe: async (types: PushNotificationType) => {
        const subscription = await getSubscription();
        if (subscription) {
            const response = await WebApi.notifications().unsubscribe(subscription.endpoint, types).fetch();
            if (!response.ok) {
                throw new Error(`Unsubscription request failed: HTTP ${response.status} - ${response.statusText}`);
            }
        }
    },
    state: async () => {
        const subscription = await getSubscription();
        if (subscription) {
            const response = await WebApi.notifications().state(subscription.endpoint).fetch();
            if (response.ok) {
                return (await response.json() as PushNotificationSubscriptionState).type
            }
        }
        return PushNotificationType.None;
    },
    validate: async () => {
        const subscription = await getSubscription();
        if (subscription && subscription.options.applicationServerKey) {
            const serverKey = new Uint8Array(await fetchServerPublicKey());
            const cachedKey = new Uint8Array(subscription.options.applicationServerKey);
            if (serverKey.byteLength !== cachedKey?.byteLength)
                return false;
            for (let index = 0; index < serverKey.length; index++) {
                if (serverKey[index] !== cachedKey[index])
                    return false;
            }
        }
        return true;
    },
    fixup: async (types: PushNotificationType) => {
        const pushManager = await getPushManager();
        if (pushManager) {
            let subscription = await pushManager.getSubscription();
            if (subscription) {
                const [, skr] = await Promise.allSettled([
                    WebApi.notifications().unsubscribe(subscription.endpoint, types).fetch(),
                    fetchServerPublicKey(),
                    subscription.unsubscribe()
                ]);

                if (skr.status === "fulfilled") {
                    subscription = await pushManager.subscribe({ applicationServerKey: skr.value, userVisibleOnly: true });
                    if (subscription) {
                        const response = await WebApi.notifications().subscribe(subscription.endpoint, types, subscription.getKey("p256dh"), subscription.getKey("auth")).fetch();
                        if (!response.ok) {
                            throw new Error("Error subscribing to server push notifications.");
                        }
                    } else {
                        throw new Error("Error subscribing to platform push notifications.");
                    }
                } else {
                    throw skr.reason;
                }
            }
        }
    }
}