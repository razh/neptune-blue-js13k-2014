// Based off of https://github.com/ooflorent/js13k-boilerplate.
'use strict';

var chalk = require('chalk');
var commander = require('commander');

var assign = require('lodash.assign');
var browserSync = require('browser-sync');
var browserify = require('browserify');
var bundleCollapser = require('bundle-collapser/plugin');
var del = require('del');
var runSequence = require('run-sequence');
var source = require('vinyl-source-stream');
var watchify = require('watchify');

var gulp = require('gulp');
var buffer = require('gulp-buffer');
var htmlmin = require('gulp-htmlmin');
var gulpif = require('gulp-if');
var micro = require('gulp-micro');
var replace = require('gulp-replace');
var size = require('gulp-size');
var uglify = require('gulp-uglify');
var util = require('gulp-util');
var zip = require('gulp-zip');

var replaceAll = require('./replaceAll');

commander.on('--help', function() {
  console.log('  Tasks:');
  console.log();
  console.log('    build\tbuild as zip file (unminifed assets).');
  console.log('    watch\tdevelopment mode.');
  console.log('    clean\tclean up dist folder.');
  console.log();
});

commander
  .usage('<task> [options]')
  .option('-p, --production', 'build for production (minify).')
  .parse(process.argv);

var production = !!commander.production;

gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: 'dist'
    }
  });
});

gulp.task('js', function() {
  var bundler = browserify('./src/js/main.js',
    assign({
      debug: !production
    }, production ? null : watchify.args));

  if (production) {
    bundler.plugin(bundleCollapser);
  } else {
    bundler = watchify(bundler);
  }

  function rebundle() {
    return bundler.bundle()
      .on('error', function onError(error) {
        util.error(error.message);
        this.emit('end');
      })
      .pipe(source('bundle.js'))
      .pipe(buffer())
      .pipe(gulpif(production, uglify()))
      .pipe(gulpif(production, replaceAll()))
      .pipe(gulp.dest('dist/js'))
      .pipe(gulpif(!production, browserSync.reload({stream: true})));
  }

  bundler
    .on('log', util.log)
    .on('update', rebundle);

  return rebundle();
});

gulp.task('html', function() {
  return gulp.src('./src/*.html')
    .pipe(gulpif(production, htmlmin({
      collapseWhitespace: true,
      removeAttributeQuotes: true,
      removeComments: true,
      minifyCSS: true
    })))
    .pipe(gulp.dest('dist'));
});

gulp.task('clean', del.bind(null, ['dist']));

gulp.task('watch-html', function() {
  return gulp.watch(['./src/*.html'], ['html', browserSync.reload]);
});

gulp.task('watch', ['clean'], function(cb) {
  return runSequence(
    ['js', 'html'],
    ['browser-sync', 'watch-html'],
    cb
  );
});

gulp.task('compress', function() {
  return gulp.src('dist/**/*')
    .pipe(zip('dist.zip'))
    .pipe(size())
    .pipe(micro({limit: 13 * 1024}))
    .pipe(gulp.dest('dist'));
})

gulp.task('build', ['clean'], function(cb) {
  return runSequence(
    ['js', 'html'],
    'compress',
    cb
  );
});

gulp.task('default', function() {
  commander.help();
});
