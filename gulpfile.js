/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

var babel = require('gulp-babel')
  , babelPluginDEV = require('./scripts/dev-expression')
  , babelPluginRewriteModules = require('./scripts/rewrite-modules')
  , del = require('del')
  , derequire = require('gulp-derequire')
  , flatten = require('gulp-flatten')
  , gulp = require('gulp')
  , gulpUtil = require('gulp-util')
  , header = require('gulp-header')
  , runSequence = require('run-sequence')
  , webpackStream = require('webpack-stream')
  , sourcemaps = require('gulp-sourcemaps')
  , mocha = require('gulp-mocha');

const HEADER = [
  '/**',
  ' * Refrax v<%= version %>',
  ' *',
  ' * Copyright (c) 2015-present, Joshua Hollenbeck',
  ' * All rights reserved.',
  ' *',
  ' * This source code is licensed under the BSD-style license found in the',
  ' * LICENSE file in the root directory of this source tree.',
  ' */'
].join('\n') + '\n';

const babelOpts = {
  plugins: [
    'babel-plugin-syntax-class-properties',
    'babel-plugin-syntax-flow',
    'babel-plugin-syntax-object-rest-spread',
    'babel-plugin-transform-es2015-template-literals',
    'babel-plugin-transform-es2015-literals',
    'babel-plugin-transform-es2015-function-name',
    'babel-plugin-transform-es2015-arrow-functions',
    'babel-plugin-transform-es2015-block-scoped-functions',
    'babel-plugin-transform-class-properties',
    ['babel-plugin-transform-es2015-classes', { loose: true }],
    'babel-plugin-transform-es2015-object-super',
    'babel-plugin-transform-es2015-shorthand-properties',
    'babel-plugin-transform-es2015-computed-properties',
    'babel-plugin-transform-es2015-for-of',
    'babel-plugin-check-es2015-constants',
    ['babel-plugin-transform-es2015-spread', { loose: true }],
    'babel-plugin-transform-es2015-parameters',
    ['babel-plugin-transform-es2015-destructuring', { loose: true }],
    'babel-plugin-transform-es2015-block-scoping',
    'babel-plugin-transform-es2015-modules-commonjs',
    'babel-plugin-transform-es3-member-expression-literals',
    'babel-plugin-transform-es3-property-literals',
    'babel-plugin-transform-flow-strip-types',
    'babel-plugin-transform-object-rest-spread',
    babelPluginDEV,
    [babelPluginRewriteModules, {
      modules: [
        'bluebird',
        'react',
        /^axios/,
        'eventemitter3',
        'pluralize',
        // test modules
        'chai',
        'sinon',
        /^mocha/
      ]
    }]

  ]
};

const buildDist = function(opts) {
  var webpackOpts = {
    externals: /^[-\/a-zA-Z0-9]+$/,
    output: {
      filename: opts.output,
      libraryTarget: 'umd',
      library: 'Refrax'
    },
    plugins: [
      new webpackStream.webpack.LoaderOptionsPlugin({
        debug: opts.debug
      }),
      new webpackStream.webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(
          opts.debug ? 'development' : 'production'
        )
      }),
      new webpackStream.webpack.optimize.OccurrenceOrderPlugin(),
      new webpackStream.webpack.optimize.DedupePlugin()
    ]
  };
  if (!opts.debug) {
    webpackOpts.plugins.push(
      new webpackStream.webpack.optimize.UglifyJsPlugin({
        compress: {
          hoist_vars: true,
          screw_ie8: true,
          warnings: false
        }
      })
    );
  }
  return webpackStream(webpackOpts, null, function(err, stats) {
    if (err) {
      throw new gulpUtil.PluginError('webpack', err);
    }
    if (stats.compilation.errors.length) {
      throw new gulpUtil.PluginError('webpack', stats.toString());
    }
  }).on('error', function(error) {
    gulpUtil.log(gulpUtil.colors.red('JS Compile Error: '), error.message);
  });
};

const paths = {
  dist: 'dist',
  lib: 'lib',
  test: 'test',
  entry: 'lib/Refrax.js',
  src: [
    '*src/**/*.js',
    '!src/**/__tests__/**/*.js'
  ],
  srcTest: [
    '*scripts/test/*.js',
    '*src/**/*.js'
  ]
};

gulp.task('clean', function(cb) {
  return del([paths.dist, paths.lib, paths.test], cb);
});

gulp.task('modules', function() {
  return gulp
    .src(paths.src)
    .pipe(babel(babelOpts))
    .pipe(flatten())
    .pipe(gulp.dest(paths.lib));
});

gulp.task('modules-test', function() {
  return gulp
    .src(paths.srcTest)
    .pipe(sourcemaps.init())
    .pipe(babel(babelOpts))
    .pipe(flatten())
    // NOTE: this is somewhat of a hack so mocha will load source maps
    .pipe(header("require('source-map-support').install();\n"))
    .pipe(sourcemaps.write({sourceRoot: ''}))
    .pipe(gulp.dest('test'));
});

gulp.task('dist', ['modules'], function() {
  var distOpts = {
    debug: true,
    output: 'refrax.js'
  };
  gulp.src(paths.entry)
    .pipe(buildDist(distOpts))
    .pipe(derequire())
    .pipe(header(HEADER, {
      version: process.env.npm_package_version
    }))
    .pipe(gulp.dest(paths.dist));
});

gulp.task('dist:min', ['modules'], function() {
  var distOpts = {
    debug: false,
    output: 'refrax.min.js'
  };
  return gulp.src(paths.entry)
    .pipe(buildDist(distOpts))
    .pipe(header(HEADER, {
      version: process.env.npm_package_version
    }))
    .pipe(gulp.dest(paths.dist));
});

gulp.task('testMocha', ['modules-test'], function() {
  return gulp
    .src([
      'test/*.spec.js'
    ], {read: false})
    .pipe(header("require('source-map-support').install();\n"))
    .pipe(
      mocha({
        require: [
          'test/ChaiDeepMatch.js',
          'test/TestSupport.js'
        ],
        reporter: 'scripts/test/Reporter.js'
      })
        .on('error', function(error) {
          this.emit('end');
        })
    );
});

gulp.task('watch', function() {
  gulp.watch(paths.src, ['modules']);
});

gulp.task('test', function(cb) {
  runSequence('clean', 'testMocha', cb);
});

gulp.task('default', function(cb) {
  runSequence('clean', ['dist', 'dist:min'], cb);
});
