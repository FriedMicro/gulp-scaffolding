var gulp = require('gulp');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var ngAnnotate = require('gulp-ng-annotate');
var ngHtml2Js = require("gulp-ng-html2js");
var minifyHtml = require("gulp-minify-html");
var wrap = require('gulp-wrap');
var clean = require('gulp-clean');
var notify = require('gulp-notify');
var size = require('gulp-filesize');
var htmlMin = require('gulp-htmlmin');

var paths = {};
paths.buildFolder = './dist';
paths = {
    frontend: {
        buildFolder: paths.buildFolder,
        sass: {
            src: './sass/**/*.scss',
            dest: paths.buildFolder
        },
        js: {
            src: ['./js/**/*.js'],
            dest: paths.buildFolder,
            filename: 'app.min.js'
        },
        html: {
            index_prod: './index.html',
            index_dev: './index-dev.html',
            prefix: '/',
            src: './views/**/*.html',
            dest: paths.buildFolder,
            filename: 'partials.min.js'
        }
    }
};

gulp.task('styles', function() {
    gulp.src(paths.frontend.sass.src)
        .pipe(sass({
            outputStyle: 'compressed'
        }).on('error', sass.logError))
        .pipe(gulp.dest(paths.frontend.sass.dest))
});

gulp.task('scripts', function() {
    gulp.src(paths.frontend.js.src)
        .pipe(concat(paths.frontend.js.filename))
        .pipe(ngAnnotate())
        .pipe(uglify().on('error', handleError))
        .pipe(gulp.dest(paths.frontend.js.dest));
});

gulp.task('partials', function() {
    gulp.src(paths.frontend.html.src)
        .pipe(minifyHtml({
            empty: true,
            spare: true,
            quotes: true
        }))
        .pipe(ngHtml2Js({
            moduleName: "Partials",
            prefix: paths.frontend.html.prefix
        }))
        .pipe(concat(paths.frontend.html.filename))
        .pipe(uglify())
        .pipe(gulp.dest(paths.frontend.html.dest));
})

gulp.task('minify', function() {
  return gulp.src(paths.frontend.html.index_prod)
    .pipe(htmlMin({collapseWhitespace: true}))
    .pipe(gulp.dest('dist'));
});

gulp.task('styles-dev', function() {
    gulp.src(paths.frontend.sass.src)
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(paths.frontend.sass.dest))
});

gulp.task('scripts-dev', function() {
    gulp.src(paths.frontend.js.src)
        .pipe(wrap('//<%= file.path %>\n<%= contents %>'))
        .pipe(concat(paths.frontend.js.filename))
        .pipe(ngAnnotate())
        .pipe(gulp.dest(paths.frontend.js.dest));
})

gulp.task('partials-dev', function() {
    gulp.src(paths.frontend.html.src)
        .pipe(ngHtml2Js({
            moduleName: "Partials",
            prefix: paths.frontend.html.prefix
        }))
        .pipe(concat(paths.frontend.html.filename))
        .pipe(gulp.dest(paths.frontend.html.dest));
})

gulp.task('minify-dev', function() {
  return gulp.src(paths.frontend.html.index_dev)
    .pipe(htmlMin({collapseWhitespace: false}))
    .pipe(gulp.dest('dist'));
});

var getSize = function(){
  gulp.src('./dist/*')
  .pipe(size())
}

//Clean folder so we can have a clean upload
gulp.task('clean', function () {
  gulp.src(paths.frontend.buildFolder, {read: false})
    .pipe(clean());
});

//Defaults to production
gulp.task('default', ['styles', 'scripts', 'partials', 'minify'], function() {
  getSize();
    gulp.watch(paths.frontend.sass.src, ['styles']);
    gulp.watch(paths.frontend.js.src, ['scripts']);
    gulp.watch(paths.frontend.html.src, ['partials']);
});

//dev for local testing
gulp.task('dev', ['styles-dev', 'scripts-dev', 'partials-dev', 'minify-dev'], function() {
  getSize();
    gulp.watch(paths.frontend.sass.src, ['styles-dev']);
    gulp.watch(paths.frontend.js.src, ['scripts-dev']);
    gulp.watch(paths.frontend.html.src, ['partials-dev']);
})

function handleError(error) {
    notify(error.toString());
    this.emit('end');
}
