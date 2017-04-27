/**
 * Copyright (c) 2015-present, Joshua Hollenbeck
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

var babel = require('gulp-babel')
  , babelPluginDEV = require('fbjs-scripts/babel/dev-expression')
  , babelPluginModules = require('fbjs-scripts/babel/rewrite-modules')
  , babelPluginAutoImporter = require('fbjs-scripts/babel/auto-importer')
  , del = require('del')
  , derequire = require('gulp-derequire')
  , flatten = require('gulp-flatten')
  , gulp = require('gulp')
  , gulpUtil = require('gulp-util')
  , header = require('gulp-header')
  // , objectAssign = require('object-assign')
  , runSequence = require('run-sequence')
  , webpackStream = require('webpack-stream')
  , sourcemaps = require('gulp-sourcemaps')
  , mocha = require('gulp-mocha');

var HEADER = [
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

var babelOpts = {
  nonStandard: true,
  loose: [
    'es6.classes'
  ],
  stage: 1,
  // optional: ['runtime'],
  plugins: [
    // babelPluginDEV,
    {
      position: 'before',
      transformer: babelPluginAutoImporter
    },
    {
      position: 'before',
      transformer: babelPluginModules
    }
  ],
  _moduleMap: {
    'bluebird': 'bluebird',
    'react': 'react',
    'axios': 'axios',
    'eventemitter3': 'eventemitter3',
    'pluralize': 'pluralize',
    // test modules
    'chai': 'chai',
    'sinon': 'sinon'
  }
};

var buildDist = function(opts) {
  var webpackOpts = {
    debug: opts.debug,
    externals: {
      'react': 'react',
      // 'bluebird': 'bluebird',
      // 'axios': 'axios',
      // 'eventemitter3': 'eventemitter3',
      // 'pluralize': 'pluralize'
    },
    output: {
      filename: opts.output,
      libraryTarget: 'umd',
      library: 'Refrax'
    },
    plugins: [
      new webpackStream.webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(
          opts.debug ? 'development' : 'production'
        )
      }),
      new webpackStream.webpack.optimize.OccurenceOrderPlugin(),
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

var paths = {
  dist: 'dist',
  lib: 'lib',
  test: 'test',
  entry: 'lib/RefraxBuild.js',
  src: [
    '*src/**/*.js',
    '!src/**/__tests__/**/*.js',
    '!src/.legacy'
  ],
  srcTest: [
    '*scripts/**/*.js',
    '*src/**/*.js',
    '*src/**/__tests__/**/*.js',
    '!src/.legacy'
  ]
};

gulp.task('clean', function(cb) {
  del([paths.dist, paths.lib, paths.test], cb);
});

gulp.task('modules', function() {
  return gulp
    .src(paths.src)
    .pipe(babel(babelOpts).on('error', function(error) {
      gulpUtil.log(gulpUtil.colors.red('Babel Error: '), error.message);
    }))
    .pipe(flatten())
    .pipe(gulp.dest(paths.lib));
});

gulp.task('modules-test', function() {
  return gulp
    .src(paths.srcTest)
    .pipe(sourcemaps.init())
      .pipe(babel(babelOpts).on('error', function(error) {
        gulpUtil.log(gulpUtil.colors.red('Babel Error: '), error.message);
      }))
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
  return gulp.src(paths.entry)
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
  return gulp.src([
    'test/ChaiDeepMatch.js',
    '*test/**/*.spec.js'
  ], {read: false})
	.pipe(
    mocha({
      reporter: 'nyan'
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
  runSequence('clean', ['testMocha'], cb);
});

gulp.task('default', function(cb) {
  runSequence('clean', ['dist', 'dist:min'], cb);
});
