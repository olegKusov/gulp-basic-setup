const { src, dest, series, watch, parallel} = require('gulp');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const rename = require('gulp-rename');
const concat = require('gulp-concat');
const del = require('del');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const importCss = require("postcss-import");
const fileinclude = require('gulp-file-include');
var browserSync = require('browser-sync').create();
const debug = require('gulp-debug');

function server(cb) {
    browserSync.init({
        server: {
          baseDir: "./dest"
        },
        port: 3000
      });
      cb();
}

function transpile() {
    return src('src/*.js')
    .pipe(concat('main.js'))
    .pipe(babel({
        presets: ['@babel/env']
    }))
    .pipe(dest('dest/', {read: false}))
    .pipe(uglify())
    .pipe(rename({ extname: '.min.js'}))
    .pipe(dest('dest/'));
}

function css(cb) {
    let plugins = [
        importCss(),
        autoprefixer({browsers: ['last 1 version']}),
        cssnano()
    ];
    return src('src/main.css')
        .pipe(postcss(plugins))
        .pipe(dest('./dest'))
        .pipe(browserSync.stream());
}

function clean() {
    return del(['./dest']);
}

function combineHTML() {
    return src('src/index.html')
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(debug({title: 'unicorn:'}))
    .pipe(dest('./dest'))
    .pipe(browserSync.stream());
}

function images() {
    return src('src/assets/images/*')
        .pipe(dest('./dest/images'))
        .pipe(browserSync.stream());
}

function watchFiles() {
    watch(['src/components/**/*.html', 'src/*.html'], combineHTML);
    watch('src/assets/images/*', images);
    watch(['src/components/**/*.css', 'src/*.css'], css);
}

exports.build = series(clean, transpile, css, combineHTML, images);

exports.default = parallel(watchFiles, server);