var gulp = require('gulp');  
var gutil = require('gulp-util');  
var clean = require('gulp-clean');  
var concat = require('gulp-concat');  
var uglify = require('gulp-uglify');  

gulp.task('clean', function () {  
  return gulp.src('src/client/build', {read: false})
    .pipe(clean());
});

gulp.task('vendor', function() {  
  return gulp.src('src/client/vendor/*.js')
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest('src/client/build'))
    .pipe(filesize())
    .pipe(uglify())
    .pipe(rename('vendor.min.js'))
    .pipe(gulp.dest('src/client/build'))
    .pipe(filesize())
    .on('error', gutil.log);
});


