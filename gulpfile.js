var gulp = require('gulp');
var connect = require('gulp-connect');
var path = require('path');
var hb = require('gulp-hb');
var obj = require('through2').obj;
var gutil = require('gulp-util');

var paths = {
  src: path.join('src', '**'),
  static: path.join('static', '**'),
  build: {
    base: path.join('build', '**'),
    static: path.join('build', 'static'),
    books: path.join('build', 'books'),
    series: path.join('build', 'series'),
    css: path.join('build', 'static', 'css')
  },
  templates: {
    base: path.join('templates', '**'),
    pages: path.join('templates', 'pages', '*.html'),
    partials: path.join('templates', 'partials', '*.hbs'),
    helpers: path.join('templates', 'helpers', '*.js'),
    generated: path.join('templates', 'generated'),
    data: path.join('templates', 'data', '*.{js,json}')
  }
};

gulp.task('watch', ['templates', 'copy', 'build'], function () {
  gulp.watch(paths.src, ['build']);
  gulp.watch(paths.templates.base, ['templates']);
  gulp.watch(paths.static, ['copy']);
  gulp.watch(paths.build.base, ['reload']);
});


gulp.task('build', function() {
  gulp.src(paths.src).pipe(gulp.dest(paths.build.css));
});

gulp.task('copy', function() {
  gulp.src(paths.static).pipe(gulp.dest(paths.build.static))
})

gulp.task('reload', function () {
  gulp.src(paths.build.base).pipe(connect.reload());
});

gulp.task('templates', ['templates:pages', 'templates:books', 'templates:series']);
gulp.task('templates:pages', function () {
  return gulp
  .src(paths.templates.pages)
  .pipe(hb({
    partials: paths.templates.partials,
    data: paths.templates.data,
    helpers: paths.templates.helpers
  }))
  .pipe(gulp.dest(path.dirname(paths.build.base)));
});

gulp.task('templates:books', function() {
  var parts = ['.', path.dirname(paths.templates.data), 'books.json'];
  var books = require(parts.join(path.sep));

  return gulp
  .src(path.join(paths.templates.generated, 'book.html'))
  .pipe(obj(function(file, _, cb) {
    var that = this;
    books.forEach(function(book) {
      var vynil = new gutil.File({
        contents: file.contents,
        path: book.isbn + '.html',
      });
      vynil.data = book;
      that.push(vynil);
    });
    cb();
  }))
  .pipe(hb({
    partials: paths.templates.partials,
    helpers: paths.templates.helpers
  }))
  .pipe(gulp.dest(paths.build.books));
});

gulp.task('templates:series', function () {
  var parts = ['.', path.dirname(paths.templates.data), 'series_detail.json'];
  var series = require(parts.join(path.sep));

  return gulp
  .src(path.join(paths.templates.generated, 'serie.html'))
  .pipe(obj(function(file, _, cb) {
    var that = this;
    series.forEach(function(serie) {
      var vynil = new gutil.File({
        contents: file.contents,
        path: serie.id + '.html',
      });
      vynil.data = serie;
      that.push(vynil);
    });
    cb();
  }))
  .pipe(hb({
    partials: paths.templates.partials,
    helpers: paths.templates.helpers
  }))
  .pipe(gulp.dest(paths.build.series));
});

gulp.task('serve', ['watch'], function () {
  connect.server({
    root: path.dirname(paths.build.base),
    livereload: true,
    host: '0.0.0.0',
    port: 8000
  });
});

gulp.task('default', ['serve']);
