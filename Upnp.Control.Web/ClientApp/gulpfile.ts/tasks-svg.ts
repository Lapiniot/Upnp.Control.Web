import gulp from "gulp";
import merge from "./gulp-merge-svg";
import stackSvgs from "./stack-icons.json";
import spriteIcons from "./symbols-icons.json";

type IconType = "materialsymbolsoutlined" | "materialsymbolsrounded" | "materialsymbolssharp";
type IconImportConfig = (string | [name: string, path: string])[];

const sourceFolder = "../../../material-design-icons/symbols/web/";
const destFolder = "./public";
const iconType: IconType = "materialsymbolsoutlined";

function generateId(name: string) {
    return name.substring(name.lastIndexOf('/') + 1, name.lastIndexOf('_'));
}

function getGlobs(config: IconImportConfig) {
    return config.map(s => typeof s === "string" ? `${s}/${iconType}/${s}_24px.svg` : s[1])
}

gulp.task("svg-symbols", function buildSvg(done) {
    gulp.src(getGlobs(spriteIcons as IconImportConfig), { cwd: sourceFolder, cwdbase: true })
        .pipe(merge({
            mode: "symbols", generateId,
            transformations: ["promoteGroupChildren", "removeInvisible"]
        }))
        .pipe(gulp.dest(destFolder));
    done();
});

gulp.task("svg-stack", function buildSvg(done) {
    gulp.src(getGlobs(stackSvgs), { cwd: sourceFolder, cwdbase: true })
        .pipe(merge({
            mode: "stack", generateId, dimensions: { w: 24, h: 24 },
            transformations: ["promoteGroupChildren", "removeInvisible"]
        }))
        .pipe(gulp.dest(destFolder));
    done();
});