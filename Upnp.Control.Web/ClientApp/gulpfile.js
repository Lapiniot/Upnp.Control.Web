const gulp = require("gulp"),
    sass = require("gulp-dart-sass"),
    sprite = require("gulp-svg-sprite");
sass.compiler = require('dart-sass');

/***** SASS compile *****/

const sassSources = ["src/styles/*.scss"];
const sassIncludePaths = ["node_modules"];
const cssDestFolder = "./src/css";

gulp.task("sass", cb => {
    gulp.src(sassSources)
        .pipe(sass({ includePaths: sassIncludePaths }).on('error', sass.logError))
        .pipe(gulp.dest(cssDestFolder));
    cb();
});

gulp.task("watch",
    gulp.series("sass", cb => {
        gulp.watch(sassSources, gulp.series("sass"));
        cb();
    }));

/***** SVG icons *****/

const svgSourceFolder = "../../../material-design-icons/src";
const svgType = "";
const svgs = ["action/home", "action/settings", "device/devices", "device/storage",
    "hardware/connected_tv", "hardware/speaker",
    "av/play_circle", "av/stop_circle", "av/pause_circle"];
const spriteDestFolder = "./public";
const spriteName = "sprite.svg";

const generateId = name => {
    const end = name.lastIndexOf('/', name.lastIndexOf('/') - 1);
    const start = name.lastIndexOf('/', end - 1) + 1;
    return name.substring(start, end);
}

gulp.task("svg", cb => {
    const globs = svgs.map(svg => `${svg}/materialicons${svgType}/24px.svg`);

    gulp.src(globs, { cwd: svgSourceFolder, cwdbase: true })
        .pipe(sprite({
            mode: { symbol: { dest: "", sprite: spriteName, render: { css: false, scss: false } } },
            shape: {
                id: { generator: generateId },
                transform: [{ svgo: { plugins: [{ removeXMLNS: true }] } }]
            },
            svg: { xmlDeclaration: false }
        }))
        .pipe(gulp.dest(spriteDestFolder));

    cb();
});