var nunjucksRender = require('gulp-nunjucks-render'),
    browserSync    = require('browser-sync'),
    runSequence    = require('run-sequence'),
    ghPages        = require('gulp-gh-pages'),
    gutil          = require('gulp-util'),
    shell          = require('gulp-shell'),
    file           = require('gulp-file'),
    gulp           = require('gulp'),
    sass           = require('gulp-sass'),
    del            = require('del');

// Clean Dist
gulp.task('clean', function() {
  return del('public');
});

// Browser Sync
gulp.task('browserSync', function() {
  browserSync({
    server: { baseDir: 'public' },
    startPath: '/en'
  });
});

// Sass
gulp.task('sass', function() {
  return gulp.src('source/sass/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('public/en'))
    .pipe(gulp.dest('public/fr'))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task('vendor', function() {
  return gulp.src('source/static/vendor/**/*')
    .pipe(gulp.dest('public/en/vendor'))
    .pipe(gulp.dest('public/fr/vendor'));
});

gulp.task('image-dev', function() {
  return gulp.src('source/static/images/**/*')
    .pipe(gulp.dest('public/en/images'))
    .pipe(gulp.dest('public/fr/images'));
});

gulp.task('js-dev', function() {
  return gulp.src('source/static/*.js')
    .pipe(gulp.dest('public/en'))
    .pipe(gulp.dest('public/fr'));
});

gulp.task('cname-en', function() {
  return file('CNAME', 'www.citizenbudget.com\n', { src: true })
    .pipe(gulp.dest('public/en'));
});

gulp.task('cname-fr', function() {
  return file('CNAME', 'www.budgetcitoyen.com\n', { src: true })
    .pipe(gulp.dest('public/fr'));
});

// Nunjucks
gulp.task('nunjucks-en', function() {
  // Gets .html and .nunjucks files in pages
  return gulp.src('source/templates/en/**/[^_]*.html')
    // Renders template with nunjucks
    .pipe(nunjucksRender({ path: 'source/templates/en' }))
    // output files in app folder
    .pipe(gulp.dest('public/en'))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task('nunjucks-fr', function() {
  // Gets .html and .nunjucks files in pages
  return gulp.src('source/templates/fr/**/[^_]*.html')
    // Renders template with nunjucks
    .pipe(nunjucksRender({ path: 'source/templates/fr' }))
    // output files in app folder
    .pipe(gulp.dest('public/fr'))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task('push-gh-master-en', shell.task([
  '=== pushing to cb-en master ===',
  'git push cb-en master'
]));

gulp.task('push-gh-master-fr', shell.task([
  '=== pushing to cb-fr master ===',
  'git push cb-fr master'
]));

gulp.task('push-gh-pages-en', function() {
  var remote = 'git@github.com:opennorth/citizen-budget-website.git';

  gutil.log('=== pushing to cb-en gh-pages ===');

  return gulp.src('public/en/**/*')
    .pipe(ghPages({ remoteUrl: remote, force: true }));
});

gulp.task('push-gh-pages-fr', function() {
  var remote = 'git@github.com:opennorth/citizen-budget-website-fr.git';

  gutil.log('=== pushing to cb-fr gh-pages ===');

  return gulp.src('public/fr/**/*')
    .pipe(ghPages({ remoteUrl: remote, force: true }));
});

gulp.task('deploy', function(callback) {
  runSequence(
    'clean',
    ['sass', 'nunjucks-en', 'nunjucks-fr', 'image-dev', 'vendor', 'js-dev'],
    ['cname-en', 'cname-fr'],
    'push-gh-master-en',
    'push-gh-pages-en',
    'push-gh-master-fr',
    'push-gh-pages-fr',
    callback
  );
});

gulp.task('watch-dev', function() {
  gulp.watch('source/sass/**/*.scss', ['sass']);
  gulp.watch('source/static/scripts.js', ['js-dev']);
  gulp.watch('source/templates/en/**/*.html', ['nunjucks-en']);
  gulp.watch('source/templates/fr/**/*.html', ['nunjucks-fr']);
  // Other watchers
});

gulp.task('run', function(callback) {
  runSequence(
    'clean',
    ['sass', 'nunjucks-en', 'nunjucks-fr', 'image-dev', 'vendor', 'js-dev'],
    ['cname-en', 'cname-fr', 'browserSync', 'watch-dev'],
    callback
  );
});

gulp.task('default', ['run']);
