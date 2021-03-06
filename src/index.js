(function() {
  'use strict';

  var gulp = require('gulp');
  var path = require('path');
  var _ = require('lodash');

  var transformer = require('./transformer');
  var validation = require('./validation');
  var processor = require('./processor');

  module.exports = function(options) {
    let defaultOptions = {
      taskDirectory: 'gulp-tasks',
      plugins: {},
      filenameDelimiter: '',
      tasknameDelimiter: '',
      config: {},
      configFile: ''
    };

    options = _.assign(defaultOptions, options);
    validation.validateOptions(options);

    options.taskDirectory = transformer.transformTaskDirectory(options.taskDirectory);
    options.configFile = transformer.transformConfigFile(options.configFile);

    // If an absolute path is passed, use this, otherwise resolve the relative path
    options.taskDirectory = (path.resolve(options.taskDirectory) === options.taskDirectory ? options.taskDirectory : path.join(path.resolve('.'), options.taskDirectory));
    validation.validateTaskDirectory(options.taskDirectory);

    options.configFile = (options.configFile) ? path.join(options.taskDirectory, options.configFile) : null;
    validation.validateConfigFile(options.configFile);

    if(options.configFile) {
      options.config = _.assign(options.config, require(options.configFile));
    }

    processor.processTaskDirectory(options, gulp);
  };
})();

/* Todo
  - Possible plugins file?
*/
