fs = require('fs')
gulp = require('gulp')
$ = require('gulp-load-plugins')()
src = 'src'
out = '../'

buildLanguages = ['gb', 'de', 'dk', 'se']

gulp.task 'flagsStyles', (done)->
  flagsList = ''
  for locale in buildLanguages
    flagsList = flagsList.concat "@include flag-icon(#{locale});\n"
  fs.writeFile src + '/sass/flags/_flag-list.scss', flagsList, done

gulp.task 'flagsImages', ->
  flagsPaths = []
  for locale in buildLanguages
    flagsPaths.push "#{src}/images/flags/4x3/#{locale}.svg"
  gulp
  .src(flagsPaths)
  .pipe $.rename((path)->
    path.dirname = 'flags/4x3/'
    path
  )
  .pipe(gulp.dest(out + '/images'))
  
gulp.task 'ejs', ->
  gulp
  .src([src + '/*.ejs'])
  .pipe($.ejs(languages:buildLanguages))
  .pipe(gulp.dest(out + '/'))

gulp.task 'images', ->
  gulp
  .src(["#{src}/images/*.*"])
  .pipe(gulp.dest(out + '/images'))

gulp.task 'scripts', ->
  gulp
  .src(["#{src}/js/*.*"])
  .pipe(gulp.dest(out + '/js'))

gulp.task 'sass', ['flagsStyles', 'flagsImages'], ->
  gulp
    .src([src + '/sass/*.scss'])
    .pipe $.sourcemaps.init()
    .pipe $.sass(
        outputStyle: 'expanded'
      ).on 'error', $.sass.logError
    .pipe $.sourcemaps.write()
    .pipe(gulp.dest(out + '/css'))

gulp.task 'watch', ->
  gulp.watch [src + '/js/*.js'], ['scripts']
  gulp.watch [src + '/sass/*.scss', src + '/sass/**/*.sass'], ['sass']
  gulp.watch [src + '/*.ejs', src + '/ejs/**/*.ejs'], ['ejs']

gulp.task 'default', ['ejs', 'scripts', 'sass', 'images', 'watch']