var gulp = require("gulp"), sass = require("gulp-sass");

const sources = ["./ClientApp/src/styles/*.scss"];

gulp.task('sass', function (cb) {
    gulp.src(sources)
        .pipe(sass())
        .pipe(gulp.dest(f => "./ClientApp/src/css/"));
    cb();
});

gulp.task('watch',
    gulp.series('sass', function (cb) {
        gulp.watch(sources, gulp.series('sass'));
        cb();
    })
);