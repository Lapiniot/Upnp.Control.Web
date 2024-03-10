import { useCallback, useEffect, useRef, useState } from "react";
import { MediaQueries } from "../services/MediaQueries";

function useMediaQuery(query: MediaQueryList, enabled: boolean = true) {
    const [matches, setMatches] = useState(query.matches);
    const ref = useRef(query);
    const listener = useCallback((event: MediaQueryListEvent) => setMatches(event.matches), []);
    useEffect(() => {
        ref.current.removeEventListener("change", listener);
        ref.current = query;

        if (enabled) {
            query.addEventListener("change", listener);
            if (matches !== query.matches)
                setMatches(query.matches);
        }

        return () => {
            query.removeEventListener("change", listener);
        }
    }, [query.media, enabled]);

    return matches;
}

export { MediaQueries, useMediaQuery }