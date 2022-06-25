import SvgStackMergeTransform, { SvgStackMergeOptions } from "./SvgTransforms/SvgStackMergeTransform";
import SvgSymbolsMergeTransform, { SvgSymbolsMergeOptions } from "./SvgTransforms/SvgSymbolsMergeTransform";

type SvgTransformOptions =
    ({ mode: "symbols" } & SvgSymbolsMergeOptions) |
    ({ mode: "stack" } & SvgStackMergeOptions);

export default function (options: SvgTransformOptions = { mode: "symbols" }) {
    const { mode, ...other } = options;
    switch (mode) {
        case "symbols":
            return new SvgSymbolsMergeTransform(other);
        case "stack":
            return new SvgStackMergeTransform(other);
        default:
            throw new Error("Unsupported transform mode.");
    }
}