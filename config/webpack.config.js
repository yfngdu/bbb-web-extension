'use strict';

const merge = require('webpack-merge');

const common = require('./webpack.common.js');
const PATHS = require('./paths');

// Merge webpack configuration files
const config = merge(common, {
  entry: {
    popup: PATHS.src + '/popup.js',
    oauth: PATHS.src + '/oauth.js',
    backgroundOauth: PATHS.src + '/backgroundOauth.js',
    contentScript: PATHS.src + '/contentScript.js',
    background: PATHS.src + '/background.js',
    settings: PATHS.src + '/settings.js'
  },
});

module.exports = config;
