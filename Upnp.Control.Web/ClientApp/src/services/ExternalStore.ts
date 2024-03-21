export abstract class ExternalStore<T extends object> implements IExternalStore<T> {
    snapshot: T | undefined = undefined;
    subscribers: Set<() => void> = new Set();

    getSnapshot = () => this.snapshot;

    subscribe = (onStoreChange: () => void) => {
        this.subscribers.add(onStoreChange);
        if (this.snapshot === undefined)
            this.updateSnapshot();
        return () => this.subscribers.delete(onStoreChange);
    }

    protected updateSnapshot = async () => {
        this.snapshot = await this.getCurrentData();
        for (const subscruber of this.subscribers) {
            subscruber();
        }
    }

    protected abstract getCurrentData(): T | PromiseLike<T | undefined> | undefined;
}