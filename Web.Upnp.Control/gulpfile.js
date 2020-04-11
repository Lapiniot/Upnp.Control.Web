/// <binding BeforeBuild='SASS' />
var gulp = require("gulp"), sass = require("gulp-sass");

const sources = [
    "./ClientApp/src/styles/index.scss"
];

const destination = "./ClientApp/src/css";

gulp.task("SASS", () => gulp.src(sources).pipe(sass()).pipe(gulp.dest(destination)));