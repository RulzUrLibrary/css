var gulp = require('gulp');
var connect = require('gulp-connect');
var path = require('path');

var src = path.join('src', '**');
var root = path.join('docs', '**');
var static = path.join('docs', 'static');

gulp.task('watch', function () {
  gulp.watch(src, ['copy']);
  gulp.watch(root, ['reload']);
});

gulp.task('copy', function() {
  gulp.src(src).pipe(gulp.dest(path.join(static, 'css')));
});

gulp.task('reload', function () {
  gulp.src(root).pipe(connect.reload());
});

gulp.task('serve', ['watch'], function () {
    connect.server({
      root: path.dirname(root),
      livereload: true,
      host: '0.0.0.0',
      port: 8000
    });
});

gulp.task('default', ['serve']);
