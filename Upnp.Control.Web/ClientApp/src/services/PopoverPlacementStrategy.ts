export abstract class PopoverPlacementStrategy {
    public abstract update(popover: HTMLElement, anchor?: HTMLElement): void;
    public abstract toggle(visibility: boolean): void;
    public abstract destroy(): void;
    public [Symbol.dispose] = () => this.destroy();
}

export type MainPlacement = "left" | "right" | "top" | "bottom"
export type AltPlacement = "start" | "end" | "center"
export type StrictPlacement = `${MainPlacement}-${AltPlacement}`
export type Placement = StrictPlacement | MainPlacement | "auto" | "fixed"