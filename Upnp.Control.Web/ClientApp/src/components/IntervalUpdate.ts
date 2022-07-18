// more efficient Timer implementation - inspired by https://www.youtube.com/watch?v=MCi6AZMkxcU
import { useCallback, useEffect, useRef } from "react";

function scheduleNext(start: number, current: number, interval: number, callback: FrameRequestCallback) {
    const ellapsed = current - start;
    const target = start + Math.round(ellapsed / interval) * interval + interval;
    setTimeout(() => requestAnimationFrame(callback), target - performance.now());
}

type UpdateCallback = (ellapsed: number) => void;

export function useIntervalUpdate(callback: UpdateCallback, active = true, interval = 1000) {
    const props = useRef({ start: 0, interval, controller: null as (AbortController | null), callback });

    const update = useCallback<FrameRequestCallback>(time => {
        const { start, interval, controller, callback } = props.current;
        if (controller?.signal.aborted) return;
        callback(time - start);
        scheduleNext(start, time, interval, update);
    }, []);

    useEffect(() => {
        props.current.controller?.abort();

        if (active) {
            const start = document.timeline.currentTime ?? 0;
            props.current = { start, interval, controller: new AbortController(), callback };
            scheduleNext(start, start, interval, update);
        }

        return () => props.current.controller?.abort();
    }, [active, interval, callback]);
}