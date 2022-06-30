import gulp from "gulp";
import sass from "gulp-dart-sass";

/***** SASS compile *****/

const sources = ["src/styles/*.scss"];
const includePaths = ["node_modules"];
const destination = "src/css";

gulp.task("scss", cb => {
    gulp.src(sources)
        .pipe(sass({ includePaths }).on('error', sass.logError))
        .pipe(gulp.dest(destination));
    cb();
});

gulp.task("watch-scss", cb => {
    gulp.watch(sources, gulp.series("scss"));
    cb();
});