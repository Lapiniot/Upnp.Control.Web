// more efficient Timer implementation - inspired by https://www.youtube.com/watch?v=MCi6AZMkxcU
import { useEffect } from "react";

function scheduleNext(start: number, current: number, interval: number, callback: FrameRequestCallback) {
    const ellapsed = current - start;
    const target = start + Math.round(ellapsed / interval) * interval + interval;
    setTimeout(() => requestAnimationFrame(callback), target - performance.now());
}

type UpdateCallback = (ellapsed: number) => void;

export function useIntervalUpdate(callback: UpdateCallback, active = true, interval = 1000) {
    useEffect(() => {
        if (active) {
            const controller = new AbortController();
            const start = (document.timeline.currentTime ?? 0) as number;

            function update(time: number) {
                if (controller.signal.aborted)
                    return;
                callback(time - start);
                scheduleNext(start, time, interval, update);
            }

            scheduleNext(start, start, interval, update);

            return () => {
                controller.abort();
            }
        }
    }, [active, interval, callback]);
}