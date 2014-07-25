var gulp = require('gulp');  
var gutil = require('gulp-util');  
var clean = require('gulp-clean');  
var concat = require('gulp-concat'); 
var flatten = require('gulp-flatten');
var minify_css = require('gulp-minify-css');
var order = require('gulp-order');
var debug = require('gulp-debug');
var livereload = require('gulp-livereload');
var connect = require('gulp-connect');
var angularFilesort = require('gulp-angular-filesort');
var inject = require('gulp-inject');
var watch  = require('gulp-watch');

// target for dist files in the R package directory
var inst_dir = 'spyre/inst/dist';
var js_dir  = inst_dir + '/scripts';
var css_dir = inst_dir + '/styles';
var font_dir = inst_dir + '/fonts';

gulp.task('clean', function () {  
    return gulp.src('spyre/inst/dist', {read: false})
        .pipe(clean());
});


// process bower_components
gulp.task('js_bower_components', function() {
    gulp.src(['client/bower_components/**/*.min.js', 
              'client/bower_components/angular-bootstrap-colorpicker/js/bootstrap-colorpicker-module.js',
              'client/bower_components/angular/angular.js',
              '!client/bower_components/angular/angular.min.js',
              '!client/bower_components/lodash/dist/lodash.underscore.min.js',
              '!client/bower_components/jquery-ui/ui/**/*.min.js',
              '!client/bower_components/angular-ui-bootstrap-bower/ui-bootstrap.min.js',
              '!client/bower_components/ng-grid/*.min.js',
              '!client/bower_components/bootstrap/**',
              '!client/bower_components/angular-bootstrap-colorpicker/test/**',
              '!client/bower_components/lodash/dist/lodash.compat.min.js'])
        .pipe(flatten())
        .pipe(order([ 
            'angular.js',
            'jquery.min.js',
            'd3.min.js',
            'vega.min.js',
            'lodash.min.js',
            'bootstrap-colorpicker-module.js',
            'angular-slider.min.js',
            'angular-slider.min.js',
            'client/bower_components/**/*.min.js']))
        .pipe(concat('bower.js'))
        .pipe(gulp.dest(js_dir));
});

gulp.task('font_bower_components', function() {
    gulp.src('client/bower_components/bootstrap/fonts/*')
        .pipe(gulp.dest(font_dir));
});



// process vendor components
gulp.task('js_vendor', function() {  
    gulp.src('client/vendor/*/*.js')
        .pipe(flatten())
        .pipe(order(['ws_events_dispatcher.js', 'lodash-line.js', 'ggvis.js']))
        .pipe(concat('vendor.js'))
        .pipe(gulp.dest(js_dir))
        .on('error', gutil.log);
});

// process spyre components
gulp.task('js_spyre', function() {
    gulp.src('client/scripts/**/*.js')
        .pipe(concat('spyre.js'))
        .pipe(gulp.dest(js_dir))
        .on('error', gutil.log);

//        .pipe(angularFilesort())
});

// process index.html
gulp.task('html_index', function() {
    gulp.src('client/index.html')
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

// start server with livereload support
gulp.task('webserver', function() {
    connect.server({livereload : true,
                    root : ['spyre/inst/dist']});
});

// livereload for development
gulp.task('livereload', function() {
  gulp.src(['./spyre/inst/dist/scripts/*.js', './spyre/inst/dist/styles/*.css', 
            './spyre/inst/dist/index.html'])
    .pipe(watch())
    .pipe(connect.reload());
});

// watch files
gulp.task('watch', function() {
    gulp.watch('./client/scripts/**/*.js', ['js_spyre']);
    gulp.watch('./client/styles/**/*.css', ['css_spyre']);
    gulp.watch('./client/index.html', ['html_index']);
});

// default task, build
gulp.task('default', ['html_index', 'font_bower_components',
                      'js_bower_components', 'js_vendor', 'js_spyre', 
                      'css_bower_components', 'css_vendor', 'css_spyre']);

// server task, test
gulp.task('server', ['default', 'watch', 'webserver', 'livereload']);

