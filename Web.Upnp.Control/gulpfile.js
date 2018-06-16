/// <binding BeforeBuild='SASS' />
var gulp = require("gulp"),
    fs = require("fs"),
    sass = require("gulp-sass");

//gulp.task("less", function () {
//    return gulp.src('Styles/main.less')
//        .pipe(less())
//        .pipe(gulp.dest('wwwroot/css'));
//});

const sources = [
    './ClientApp/src/styles/index.scss'
];

const destination = './ClientApp/src/css';

gulp.task("SASS", () => gulp.src(sources).pipe(sass()).pipe(gulp.dest(destination)));