var gulp = require('gulp');  
var gutil = require('gulp-util');  
var clean = require('gulp-clean');  
var concat = require('gulp-concat'); 
var flatten = require('gulp-flatten');
var minify_css = require('gulp-minify-css');
var livereload = require('gulp-livereload');

// target for dist files in the R package directory
var inst_dir = 'spyre/inst/dist';
var js_dir  = inst_dir + '/scripts';
var css_dir = inst_dir + '/styles';

gulp.task('clean', function () {  
    return gulp.src('spyre/inst/dist', {read: false})
        .pipe(clean());
});

// process vendor components
gulp.task('js_vendor', function() {  
    return gulp.src('client/vendor/*/*.js')
        .pipe(concat('vendor.js'))
        .pipe(gulp.dest(js_dir))
        .on('error', gutil.log);
});

// process bower_components
gulp.task('js_bower_components', function() {
    gulp.src('client/bower_components/**/*.min.js')
        .pipe(flatten())
        .pipe(concat('bower.js'))
        .pipe(gulp.dest(js_dir));
});

// process spyre components
gulp.task('js_spyre', function() {
    return gulp.src('client/scripts/**/*.js')
        .pipe(concat('spyre.js'))
        .pipe(gulp.dest(js_dir))
        .on('error', gutil.log);
});

// process index.html
gulp.task('html_index', function() {
    return gulp.src('client/index.html')
        .pipe(gulp.dest(inst_dir))
        .on('error', gutil.log);
});

// process spyre css
gulp.task('css_spyre', function() {
  gulp.src('./client/styles/*.css')
        .pipe(concat('spyre.css'))
        .pipe(minify_css({keepBreaks:true}))
        .pipe(gulp.dest(css_dir));
});

// process bower css
gulp.task('css_bower_components', function() {
  gulp.src('./client/bower_components/**/*.css')
        .pipe(concat('bower.css'))
        .pipe(minify_css({keepBreaks:true}))
        .pipe(gulp.dest(css_dir));
});

// process vendor css
gulp.task('css_vendor', function() {
  gulp.src('./client/vendor/**/*.css')
        .pipe(concat('vendor.css'))
        .pipe(minify_css({keepBreaks:true}))
        .pipe(gulp.dest(css_dir));
});


// livereload for development
gulp.task('livereload', function() {
});

gulp.task('default', ['html_index', 
                      'js_vendor', 'js_bower_components', 'js_spyre', 
                      'css_vendor', 'css_bower_components', 'css_spyre']);

gulp.task('server', ['html_index', 
                     'js_vendor', 'js_bower_components', 'js_spyre', 
                     'css_vendor', 'css_bower_components', 'css_spyre',
                     'livereload']);

