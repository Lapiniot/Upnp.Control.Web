var gulp = require("gulp"), sass = require("gulp-dart-sass");
sass.compiler = require('dart-sass');

const sources = ["src/styles/*.scss"];
const includePaths = ["node_modules"];

gulp.task("sass",
    function (cb) {
        gulp.src(sources)
            .pipe(sass({ includePaths }).on('error', sass.logError))
            .pipe(gulp.dest("./src/css"));
        cb();
    });

gulp.task("watch",
    gulp.series("sass",
        function (cb) {
            gulp.watch(sources, gulp.series("sass"));
            cb();
        })
);