var gulp = require('gulp');
var gutil = require('gulp-util');
var eslint = require('gulp-eslint');
var babel = require('gulp-babel');
var webpack = require('webpack');
var webpackConfiguration = require('./webpack.config.js');
var del = require('del');
var fs = require('fs');

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

gulp.task('copy', function() {
  return gulp.src(['src/**/*', '!src/**/*.js'])
    .pipe(gulp.dest('lib'));
});

gulp.task('clean', function() {
  return del([
    'dist/**/*',
    'lib/**/*'
  ]);
});

gulp.task('default', ['test', 'webpack', 'babel', 'copy']);
