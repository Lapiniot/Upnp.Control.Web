import { useCallback, useEffect, useRef, useState } from "react";
import { MediaQueries } from "../services/MediaQueries";

function useMediaQuery(query: MediaQueryList) {
    const [matches, setMatches] = useState(query.matches);
    const ref = useRef(query);
    const listener = useCallback((event: MediaQueryListEvent) => setMatches(event.matches), []);
    useEffect(() => {
        ref.current.removeEventListener("change", listener);
        ref.current = query;
        query.addEventListener("change", listener);
        if (matches !== query.matches)
            setMatches(query.matches);
        return () => query.removeEventListener("change", listener);
    }, [query.media]);
    return matches;
}

export { MediaQueries, useMediaQuery }