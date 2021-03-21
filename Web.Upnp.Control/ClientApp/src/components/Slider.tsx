import { HTMLProps, useCallback } from "react";
import { ProgressProps } from "./Progress";

export type SliderChangeHandler = (position: number) => void

type SliderProps = HTMLProps<HTMLDivElement> & Omit<ProgressProps, "infinite"> & {
    onChangeRequested?: SliderChangeHandler;
}

export default function Slider({ progress, trackStyle: style = {}, onChangeRequested, readOnly, className, ...other }: SliderProps) {

    const clickHandler = useCallback(({ currentTarget: element, clientX }) => {
        if (element) {
            const rect = element.getBoundingClientRect();
            const position = (clientX - rect.left) / element.clientWidth;
            onChangeRequested?.(position);
        }
    }, [onChangeRequested]);

    style["--slider-progress"] = progress;

    return <div {...other} className={`w-100${className ? ` ${className}` : ""}`} onClick={!readOnly ? clickHandler : undefined} role="button">
        <div className="slider-track" style={style}>
            <div className="slider-indicator" />
            <div className="slider-thumb"><div /></div>
        </div>
    </div>;
}