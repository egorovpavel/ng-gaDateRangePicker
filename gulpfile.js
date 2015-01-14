var gulp = require('gulp'),
    clean = require('gulp-clean'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    minifyCSS = require('gulp-minify-css'),
    footer = require('gulp-footer'),
    gzip = require('gulp-gzip'),
    es = require('event-stream');

var buildPath = "./build/";
/**
 * Normal Version
 **/
gulp.task('gaDatePickerRange', function() {
    return es.merge(
        gulp.src(['./src/js/gaDatePickerRange.js' ])
            .pipe( gulp.dest( buildPath  + 'js/alone/' ) )
    );
});
/**
 * Minified Version
 */
gulp.task('gaDatePickerRange-min', function() {
    return es.merge(
        gulp.src(['./src/js/gaDatePickerRange.js' ])
            .pipe( concat( 'gaDatePickerRange.min.js' ) )
            .pipe( uglify( {outSourceMap: true} ) )
            .pipe( gulp.dest( buildPath  + 'js/alone/' ) )
    );
});
/**
 *
 */
gulp.task('gaDatePickerRange-withMoment', function() {
    return es.merge(
        gulp.src(['./bower_components/moment/min/moment-with-locales.js' , './src/js/gaDatePickerRange.js' ])
            .pipe( concat( 'gaDatePickerRange.js' ) )
            .pipe( gulp.dest( buildPath  + '/js/withMomentLocales' ) )
    );
});

/**
 *
 */
gulp.task('gaDatePickerRange-withMoment-min', function() {
    return es.merge(
        gulp.src(['./bower_components/moment/min/moment-with-locales.js' , './src/js/gaDatePickerRange.js' ])
            .pipe( concat( 'gaDatePickerRange.min.js' ) )
            .pipe( uglify( {outSourceMap: true} ) )
            .pipe( gulp.dest( buildPath  + '/js/withMomentLocales' ) )
    );
});
/**
 *
 */
gulp.task('minifyCss', function() {
    return es.merge(
        gulp.src(['./src/css/*' ])
            .pipe( minifyCSS({keepSpecialComments:0,compatibility:0}) )
            .pipe( gulp.dest( buildPath  + '/css/' ) )
    );
});
/**
 * Compress
 */
gulp.task( 'compress' , function() {
    return es.merge(
        gulp.src( [ './' + buildPath + '/js/alone/*.js' , './' + buildPath + '/js/alone/*.min.js.map' ] )
        .pipe( gzip() )
        .pipe( gulp.dest( buildPath + '/js/alone'  ) ) ,
        gulp.src( [ './' + buildPath + '/js/withMomentLocales/*.js' , './' + buildPath + '/js/withMomentLocales/*.min.js.map' ] )
            .pipe( gzip() )
            .pipe( gulp.dest( buildPath + '/js/withMomentLocales'  ) ),
        gulp.src( [ './' + buildPath + '/css/*.css' ] )
            .pipe( gzip() )
            .pipe( gulp.dest( buildPath + '/css'  ) )
     );
} );
/**
 * Clean App
 */
gulp.task('clean', function(){
    return gulp.src( buildPath + "**/*" , { read : false } ).pipe(clean());
} );
/**
 * Light for Dev
 **/
gulp.task( 'dev' , [ 'gaDateRangePicker' , 'gaDateRangePicker-min' , 'gaDatePickerRange-withMoment' , 'gaDatePickerRange-withMoment-min' , 'minifyCss' ] , function() {
    return gulp.run('compress');
} );
/**
 * Default
 */
gulp.task( 'default' , [ 'gaDatePickerRange' , 'gaDatePickerRange-min' , 'gaDatePickerRange-withMoment' , 'gaDatePickerRange-withMoment-min' , 'minifyCss' ] , function() {
        return gulp.run('compress');
} );
