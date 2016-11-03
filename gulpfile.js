var gulp = require('gulp');
var gutil = require('gulp-util');
var eslint = require('gulp-eslint');
var babel = require('gulp-babel');
var sassGlob = require('gulp-sass-glob');
var sass = require('gulp-sass');
var webpack = require('webpack');
var webpackConfiguration = require('./webpack.config.js');
var del = require('del');

gulp.task('lint', function () {
  return gulp.src(['src/**/*.js', 'test/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});

gulp.task('test', ['lint']);

gulp.task('webpack', function(callback) {
  // run webpack
  webpack(webpackConfiguration, function(err, stats) {
    if (err) throw new gutil.PluginError('webpack', err);
    gutil.log('[webpack]', stats.toString({}));
    callback();
  });
});

gulp.task('babel', function() {
  return gulp.src(['src/**/*.js'])
    .pipe(babel())
    .pipe(gulp.dest('lib'));
});

gulp.task('sass', function() {
  return gulp.src('src/style/index.scss')
    .pipe(sassGlob())
    .pipe(sass())
    .pipe(gulp.dest('lib/style/'));
});

gulp.task('copy', function() {
  return gulp.src(['src/**/*', '!src/**/*.js', '!src/style/**'])
    .pipe(gulp.dest('lib'));
});

gulp.task('clean', function() {
  return del([
    'dist/**/*',
    'lib/**/*'
  ]);
});

gulp.task('default', ['test', 'webpack', 'babel', 'copy', 'sass']);
