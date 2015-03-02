'use strict';

var fs = require('fs');
var _ = require('lodash');
var gulp = require('gulp');
var debug = require('debug')('gulp-simple-task-loader');
var path = require('path');

var defaultOptions = {
  taskDirectory: 'gulp-tasks',
  plugins: {},
  config: {
    filenameDelimiter: '',
    taskDelimiter: ''
  }
};

module.exports = function(options) {
  options = _.assign(defaultOptions, options);

  if(typeof options.taskDirectory !== String) {
    options.taskDirectory = defaultOptions.taskDirectory;
  }

  if(options.taskDirectory[0] !== path.sep && options.taskDirectory.slice(0,2) !== '.' + path.sep) {
    options.taskDirectory = path.join(process.cwd(), options.taskDirectory);
  }

  fs.readdirSync(options.taskDirectory)
    .forEach(function(filename) {
      let file = path.join(options.taskDirectory, filename);
      let stat = fs.statSync(file);

      if(stat.isFile() && filename.slice(-3) !== '.js') {
        return;
      }

      let taskname = filename.slice(0,-3);
      taskname = taskname.replace(options.config.filenameDelimiter, options.config.taskDelimiter);
      let taskinfo = require(file)(gulp, options.plugins, options.config);

      gulp.task.apply(gulp, [taskname].concat(taskinfo));
    });
};