gulp = require('gulp')
$ = require('gulp-load-plugins')()
src = 'src'
out = '../'

gulp.task 'clean', ->
  gulp
  .src(out, read:false)
  .pipe($.clean())

gulp.task 'ejs', ->
  gulp
  .src([src + '/*.ejs'])
  .pipe($.ejs(languages:['gb', 'de', 'dk', 'se']))
  .pipe(gulp.dest(out + '/'))

gulp.task 'images', ->
  gulp
  .src(["#{src}/images/*.*", "#{src}/images/**/*.*"])
  .pipe(gulp.dest(out + '/images'))

gulp.task 'sass', ->
  gulp
    .src([src + '/sass/*.scss'])
    .pipe $.sourcemaps.init()
    .pipe $.sass(
        outputStyle: 'compressed'
      ).on 'error', $.sass.logError
    .pipe $.sourcemaps.write()
    .pipe(gulp.dest(out + '/css'))

gulp.task 'coffee', ->
  gulp
    .src([src + '/coffee/*.coffee'])
    .pipe($.coffee(bare: true))
    .pipe(gulp.dest(out + '/js'))

gulp.task 'watch', ->
  gulp.watch [src + '/sass/*.scss', src + '/sass/**/*.sass'], ['sass']
  gulp.watch [src + '/*.ejs', src + '/ejs/**/*.ejs'], ['ejs']
  gulp.watch [src + '/coffee/*.coffee'], ['coffee']

gulp.task 'default', ['ejs', 'coffee', 'sass', 'images', 'watch']