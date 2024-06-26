import { HTMLAttributes, useCallback, useRef } from "react";
import { formatTime } from "../services/Extensions";
import { useIntervalUpdate } from "../hooks/IntervalUpdate";

type TimerProps = { running: boolean; current: number; interval?: number }

export default function ({ current, running, interval, ...other }: TimerProps & HTMLAttributes<HTMLTimeElement>) {
    const ref = useRef<HTMLTimeElement>(null);
    const callback = useCallback((ellapsed: number) => {
        if (ref?.current) {
            ref.current.textContent = formatTime(ellapsed / 1000 + current);
        }
    }, [current]);
    useIntervalUpdate(callback, running, interval);

    return <time role="timer" {...other} ref={ref}>{formatTime(current)}</time>;
}