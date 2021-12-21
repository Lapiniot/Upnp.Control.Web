export class HotKey extends Object {

    public readonly code: string;
    public readonly alt: boolean;
    public readonly ctrl: boolean;
    public readonly shift: boolean;
    public readonly meta: boolean;
    private cached: string | undefined;

    constructor(code: string, alt: boolean = false, ctrl: boolean = false, shift: boolean = false, meta: boolean = false) {
        super();
        this.code = code;
        this.alt = alt;
        this.ctrl = ctrl;
        this.shift = shift;
        this.meta = meta;
    }

    override toString(): string {
        return this.cached = this.cached ?? (getPrefix(this.ctrl, this.alt, this.shift, this.meta) +
            (this.code.startsWith("Key") ? this.code.substring(3) : this.code));
    }

    equals(other: HotKey): boolean {
        return this.code === other.code
            && this.alt === other.alt
            && this.ctrl === other.ctrl
            && this.shift === other.shift
            && this.meta === other.meta;
    }
}

const getPrefix = ((window.navigator as any).userAgentData.platform === "macOS"
    || /Macintosh|iPad|iPhone/.test(window.navigator.userAgent))
    ? function getPrefix(ctrl: boolean, alt: boolean, shift: boolean, meta: boolean) {
        let prefix = "";
        if (ctrl) prefix += "⌃"
        if (alt) prefix += "⌥"
        if (shift) prefix += "⇧"
        if (meta) prefix += "⌘";
        return prefix;
    } : function getPrefix(ctrl: boolean, alt: boolean, shift: boolean, meta: boolean) {
        let prefix = "";
        if (ctrl) prefix += "Ctrl+"
        if (alt) prefix += "Alt+"
        if (shift) prefix += "Shift+"
        if (meta) prefix += "Win+";
        return prefix;
    }

class HotKeys {
    static readonly createNew = new HotKey("KeyN", false, true, true);
    static readonly delete = new HotKey("Delete");
    static readonly showInfo = new HotKey("Space");
    static readonly rename = new HotKey("F2");
    static readonly duplicate = new HotKey("KeyD", false, true, true);
}

export { HotKeys }