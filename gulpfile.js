var gulp = require('gulp');
var gutil = require('gulp-util');
var eslint = require('gulp-eslint');
var babel = require('gulp-babel');
var sassGlob = require('gulp-sass-glob');
var sass = require('gulp-sass');
var webpack = require('webpack');
var webpackConfiguration = require('./webpack.config.js');
var del = require('del');
var path = require('path');

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

gulp.task('webpackLib', function(callback) {
  // run webpack
  webpack({
    entry: './src/view/index.js',
    output: {
      path: path.join(__dirname, 'lib'),
      filename: 'initView.dist.js',
      library: 'kkiro3d',
      libraryTarget: 'commonjs2'
    },
    externals: [/^fudge.*$/, /^webglue.*$/, /^gl-matrix.*$/],
    module: {
      loaders: [
        {
          test: /\.jsx?$/i,
          exclude: /node_modules/,
          loader: 'babel'
        },
        {
          test: /\.json$/i,
          loader: 'json'
        },
        {
          test: /\.html?$/i,
          loader: 'html'
        },
        {
          test: /\.css$/i,
          loader: 'style!css!import-glob'
        },
        {
          test: /\.s[ca]ss$/i,
          loader: 'style!css!sass!import-glob'
        },
        {
          test: /(\.vert|\.frag|\.obj|\.mtl)$/i,
          loader: 'raw'
        },
        {
          test: /\.(otf|eot|svg|ttf|woff|woff2)(\?.+)?$/,
          loader: 'url-loader?limit=10240'
        },
        {
          test: /\.(png|jpe?g|gif|tiff|mp4|mkv|webm)?$/,
          loader: 'file-loader'
        }
      ]
    }
  }, function(err, stats) {
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

gulp.task('default', ['test', 'webpack', 'webpackLib',
  'babel', 'copy', 'sass']);
