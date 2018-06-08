/// <binding BeforeBuild='sass' />
var gulp = require("gulp"),
    fs = require("fs"),
    sass = require("gulp-sass");

//gulp.task("less", function () {
//    return gulp.src('Styles/main.less')
//        .pipe(less())
//        .pipe(gulp.dest('wwwroot/css'));
//});

gulp.task("sass", function () {
    return gulp.src([
        './ClientApp/src/styles/bootstrap.scss',
        './ClientApp/src/styles/index.scss'])
        .pipe(sass())
        .pipe(gulp.dest('./ClientApp/src/css'));
});