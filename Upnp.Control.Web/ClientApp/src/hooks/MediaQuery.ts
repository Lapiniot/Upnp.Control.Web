import { MediaQueries } from "@services/MediaQueries";
import { useMemo, useSyncExternalStore } from "react";

function useMediaQuery(query: MediaQueryList) {
    const store = useMemo(() => ({
        subscribe(onStoreChange: () => void) {
            query.addEventListener("change", onStoreChange);
            return () => {
                query.removeEventListener("change", onStoreChange);
            }
        },
        getSnapshot() { return query.matches; }
    }), [query]);

    return useSyncExternalStore(store.subscribe, store.getSnapshot);
}

export { MediaQueries, useMediaQuery }