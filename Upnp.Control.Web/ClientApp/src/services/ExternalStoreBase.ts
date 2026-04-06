export abstract class ExternalStoreBase<T> implements ExternalStore<T> {
    private subscribers: Set<() => void> = new Set();

    public abstract getSnapshot(): T;

    public subscribe = (onStoreChange: () => void) => {
        this.subscribers.add(onStoreChange);
        return () => this.subscribers.delete(onStoreChange);
    }

    protected notifyUpdated = () => {
        for (const subscriber of this.subscribers) {
            subscriber();
        }
    }
}