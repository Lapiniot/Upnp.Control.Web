import gulp from "gulp";
import sass from "gulp-dart-sass";

/***** SASS compile *****/

const sources = ["src/styles/*.scss"];
const includePaths = ["node_modules"];
const destination = "src/css";

gulp.task("sass", cb => {
    gulp.src(sources)
        .pipe(sass({ includePaths }).on('error', sass.logError))
        .pipe(gulp.dest(destination));
    cb();
});

gulp.task("watch", cb => {
    gulp.watch(sources, gulp.series("sass"));
    cb();
});