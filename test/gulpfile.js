'use strict';

var gulp = require('gulp');

var browserSync = require('browser-sync');
var browserify = require('browserify');
var del = require('del');
var source = require('vinyl-source-stream');

var gulp = require('gulp');
var buffer = require('gulp-buffer');
var util = require('gulp-util');

gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: 'dist',
      port: 3001
    }
  });
});

gulp.task('js', function() {
  return browserify('./main.js', {debug: true})
    .bundle()
    .on('error', util.log)
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(gulp.dest('dist/js'));
});

gulp.task('html', function() {
  return gulp.src('./**/*.html')
    .pipe(gulp.dest('dist'));
});

gulp.task('clean', del.bind(null, ['dist']));

gulp.task('default', ['js', 'html', 'browser-sync'], function() {
  gulp.watch([
    './**/*.js', '!./dist/**/*.js', '!./gulpfile.js'
  ], ['js', browserSync.reload]);
  gulp.watch([
    './**/*.html', '!./dist/**/*.html'
  ], ['html', browserSync.reload]);
});
