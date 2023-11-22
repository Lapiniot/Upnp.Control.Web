import WebApi, { PushNotificationSubscriptionState, PushNotificationType } from "./WebApi";

export default {
    subscribe: async (type: PushNotificationType) => {
        const swReg = await navigator.serviceWorker.ready;
        if (swReg) {
            const subscription = await swReg.pushManager.getSubscription()
                ?? await swReg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: await (await WebApi.notifications().serverKey().fetch()).arrayBuffer()
                });
            if (!subscription) throw new Error("PushManager subscription failed");
            const response = await WebApi.notifications().subscribe(subscription.endpoint, type, subscription.getKey("p256dh"), subscription.getKey("auth")).fetch();
            if (!response.ok) {
                throw new Error(`Subscription request failed: HTTP ${response.status} - ${response.statusText}`);
            }
        }
    },
    unsubscribe: async (type: PushNotificationType) => {
        const swReg = await navigator.serviceWorker.ready;
        if (swReg) {
            const subscription = await swReg.pushManager.getSubscription();
            if (subscription) {
                const response = await WebApi.notifications().unsubscribe(subscription.endpoint, type).fetch();
                if (!response.ok) {
                    throw new Error(`Unsubscription request failed: HTTP ${response.status} - ${response.statusText}`);
                }
            }
        }
    },
    state: async (): Promise<PushNotificationType> => {
        const swReg = await navigator.serviceWorker.ready;
        if (swReg) {
            const subscription = await swReg.pushManager.getSubscription();
            if (subscription) {
                const response = await WebApi.notifications().state(subscription.endpoint).fetch();
                if (response.ok) {
                    return (await response.json() as PushNotificationSubscriptionState).type
                }
            }
        }
        return PushNotificationType.None;
    }
}