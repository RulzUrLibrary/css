var gulp = require('gulp');
var connect = require('gulp-connect');
var path = require('path');
var hb = require('gulp-hb');
var ghp = require('gulp-gh-pages');
var obj = require('through2').obj;
var gutil = require('gulp-util');
var sass = require('gulp-sass');
var del = require('del');


var url = function() {
  return (gutil.env.prod ? '/css/' : '/') + [].slice.call(arguments, 0, -1).join('/');
}

var paths = {
  src: {
    base:   path.join('src'),
    scss:   path.join('src', 'main.scss'),
    fonts:  path.join('src', 'fonts')
  },
  dist: {
    base:    path.join('dist'),
    static:  path.join('dist', 'static'),
    books:   path.join('dist', 'books'),
    series:  path.join('dist', 'series'),
    css:     path.join('dist', 'static', 'css')
  },
  docs: {
    base:       path.join('docs'),
    static:     path.join('docs', 'static'),
    pages:      path.join('docs', 'pages', '*.html'),
    partials:   path.join('docs', 'partials', '*.hbs'),
    helpers:    path.join('docs', 'helpers', '*.js'),
    generated:  path.join('docs', 'generated'),
    data:       path.join('docs', 'data', '*.{js,json}')
  }
};

gutil.env.prod = false;

gulp.task('watch', ['templates', 'fonts', 'copy', 'build'], function () {
  var last = (new Date).getTime();
  gulp.watch(path.join(paths.src.base, '**', '*'), ['build']);
  gulp.watch(path.join(paths.docs.base, '**', '*'), ['templates']);
  gulp.watch(path.join(paths.docs.static, '**', '*') ['copy']);
  gulp.watch(path.join(paths.dist.base, '**', '*'), function(event) {
    var current = (new Date).getTime();
    if (current - last > 1000) {
      gulp.start('reload');
      last = current;
    }
  });
});

gulp.task('clean', function() {
  return del(paths.dist.base);
});

gulp.task('build', function () {
  return gulp.src(paths.src.scss)
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(gulp.dest(paths.dist.css));
});

gulp.task('copy', function() {
  return gulp.src(path.join(paths.docs.static, '**', '*'))
    .pipe(gulp.dest(paths.dist.static));
})

gulp.task('fonts', function() {
  return gulp.src(path.join(paths.src.fonts, '**', '*'), {base: paths.src.base})
    .pipe(gulp.dest(paths.dist.css));
})

gulp.task('reload', function () {
  gulp.src(paths.dist.base).pipe(connect.reload());
});

gulp.task('templates', ['templates:pages', 'templates:books', 'templates:series']);
gulp.task('templates:pages', function () {
  return gulp
  .src(paths.docs.pages)
  .pipe(hb({
    partials: paths.docs.partials,
    data: paths.docs.data,
    helpers: paths.docs.helpers
  }).helpers({'url': url}))
  .pipe(gulp.dest(paths.dist.base));
});

gulp.task('templates:books', function() {
  var parts = ['.', path.dirname(paths.docs.data), 'books.json'];
  var books = require(parts.join(path.sep));

  return gulp
  .src(path.join(paths.docs.generated, 'book.html'))
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
    partials: paths.docs.partials,
    helpers: paths.docs.helpers
  }).helpers({'url': url}))
  .pipe(gulp.dest(paths.dist.books));
});

gulp.task('templates:series', function () {
  var parts = ['.', path.dirname(paths.docs.data), 'series_detail.json'];
  var series = require(parts.join(path.sep));

  return gulp
  .src(path.join(paths.docs.generated, 'serie.html'))
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
    partials: paths.docs.partials,
    helpers: paths.docs.helpers
  }).helpers({'url': url}))
  .pipe(gulp.dest(paths.dist.series));
});

gulp.task('serve', ['watch'], function () {
  connect.server({
    root: paths.dist.base,
    livereload: true,
    host: '0.0.0.0',
    port: 8000
  });
});

gulp.task('prod', function() { gutil.env.prod = true; });

gulp.task('deploy', ['prod', 'templates', 'fonts', 'copy', 'build'], function() {
  return gulp.src(path.join(paths.dist.base, '**', '*'))
  .pipe(ghp());
});

gulp.task('default', ['serve']);
