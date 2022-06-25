import gulp from "gulp";
import merge from "./gulp-merge-svg";

const sourceFolder = "../../../material-design-icons/src";
const destFolder = "./public/icons";
const iconType = "";
const spriteSvgs = ["action/home", "action/settings", "device/devices", "device/storage",
    "hardware/connected_tv", "hardware/speaker",
    "av/play_circle", "av/stop_circle", "av/pause_circle"];
const stackSvgs = ["device/storage", "hardware/connected_tv", "hardware/speaker"];

function generateId(name: string) {
    const end = name.lastIndexOf('/', name.lastIndexOf('/') - 1);
    const start = name.lastIndexOf('/', end - 1) + 1;
    return name.substring(start, end);
}

function getGlobs(svgs: string[]) {
    return svgs.map(s => `${s}/materialicons${iconType}/24px.svg`);
}

gulp.task("svg", function buildSvg(done) {
    gulp.src(getGlobs(spriteSvgs), { cwd: sourceFolder, cwdbase: true })
        .pipe(merge({ mode: "symbols", generateId, formatting: { omitXmlDeclaration: true, pretty: true } }))
        .pipe(gulp.dest(destFolder));

    gulp.src(getGlobs(stackSvgs), { cwd: sourceFolder, cwdbase: true })
        .pipe(merge({ mode: "stack", generateId, formatting: { omitXmlDeclaration: true, pretty: true }, dimensions: { w: 24, h: 24 } }))
        .pipe(gulp.dest(destFolder));

    done();
});