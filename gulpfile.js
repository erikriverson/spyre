var gulp = require('gulp');  
var gutil = require('gulp-util');  
var clean = require('gulp-clean');  
var concat = require('gulp-concat');  
var uglify = require('gulp-uglify');  

gulp.task('clean', function () {  
    return gulp.src('src/client/build', {read: false})
        .pipe(clean());
});

gulp.task('js_vendor', function() {  
    return gulp.src('src/client/vendor/*/*.js')
        .pipe(concat('vendor.js'))
        .pipe(gulp.dest('src/client/build'))
        .on('error', gutil.log);
});

// process bower_components

gulp.task('js_bower_components', function() {
    return gulp.src('src/client/bower_components/**/*min.js')
        .pipe(concat('bower.js'))
        .pipe(gulp.dest('src/client/build'))
        .on('error', gutil.log);
});

gulp.task('js_spyre', function() {
    return gulp.src('src/client/scripts/**/*.js')
        .pipe(concat('spyre.js'))
        .pipe(gulp.dest('src/client/build'))
        .on('error', gutil.log);
});


gulp.task('default', ['js_vendor', 'js_bower_components', 'js_spyre']);
