import gulp from "gulp";
import merge from "./gulp-merge-svg";
import spriteIcons from "./symbols-icons.json";
import stackSvgs from "./stack-icons.json";

type IconType = "" | "outlined" | "round" | "sharp" | "twotone";
type IconImportConfig = (string | [name: string, type: string])[];

const sourceFolder = "../../../material-design-icons/src";
const destFolder = "./public";
const iconType: IconType = "outlined";

function generateId(name: string) {
    const end = name.lastIndexOf('/', name.lastIndexOf('/') - 1);
    const start = name.lastIndexOf('/', end - 1) + 1;
    return name.substring(start, end);
}

function getGlobs(config: IconImportConfig) {
    return config.map(s => typeof s === "string"
        ? `${s}/materialicons${iconType}/24px.svg`
        : `${s[1]}/materialicons${s[0]}/24px.svg`);
}

gulp.task("svg-symbols", function buildSvg(done) {
    gulp.src(getGlobs(spriteIcons), { cwd: sourceFolder, cwdbase: true })
        .pipe(merge({
            mode: "symbols", generateId,
            optimizations: ["promoteGroupChildren", "removeInvisible"]
        }))
        .pipe(gulp.dest(destFolder));
    done();
});

gulp.task("svg-stack", function buildSvg(done) {
    gulp.src(getGlobs(stackSvgs), { cwd: sourceFolder, cwdbase: true })
        .pipe(merge({
            mode: "stack", generateId, dimensions: { w: 24, h: 24 },
            optimizations: ["promoteGroupChildren", "removeInvisible"]
        }))
        .pipe(gulp.dest(destFolder));
    done();
});