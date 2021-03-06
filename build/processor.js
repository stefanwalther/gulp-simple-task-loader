'use strict';

(function () {
  'use strict';

  var async = require('async');
  var path = require('path');
  var fs = require('fs');
  var _ = require('lodash');

  function voidFunction() {
    return;
  }

  function isConfigFile(configFile, filename) {
    return configFile && configFile.indexOf(filename) !== -1;
  }

  function hasValidExtension(filename) {
    var extname = path.extname(filename);
    return extname === '.js' || extname === '.coffee';
  }

  function isDirectory(directory, filename) {
    var file = path.resolve(directory, filename);
    return fs.statSync(file).isDirectory();
  }

  module.exports = {
    processTaskDirectory: function processTaskDirectory(options, gulp) {
      function processDirectory(dir) {
        function filterFilenames(filename) {
          return !isConfigFile(options.configFile, filename) && (hasValidExtension(filename) || isDirectory(dir, filename));
        }

        function mapFiles(filename) {
          var file = path.resolve(dir, filename);

          if (fs.statSync(file).isDirectory()) {
            return { directory: true, filename: filename };
          } else {
            var taskname = path.basename(filename, path.extname(filename));
            taskname = taskname.split(options.filenameDelimiter).join(options.tasknameDelimiter);
            return { file: file, filename: filename, taskname: taskname };
          }
        }

        function handleFileOrDirectory(obj) {
          if (obj.directory) {
            processDirectory(dir + '/' + obj.filename);
          } else {
            createTask(obj);
          }
        }

        function createTask(obj) {
          var taskinfo = require(obj.file)(gulp, _.defaults(options.config, _.omit(options, ['config', 'plugins'])), options.plugins);
          var taskdeps = taskinfo.deps || [];
          var taskparams = taskinfo.params || [];
          var taskfn = taskinfo.deps || taskinfo.fn || taskinfo.params ? taskinfo.fn || voidFunction : taskinfo;

          if (taskparams.length > 0) {
            gulp.task(obj.taskname, taskdeps, function () {
              async.map(taskparams, function (params, callback) {
                taskfn(params, callback);
              });
            });
          } else {
            gulp.task(obj.taskname, taskdeps, taskfn);
          }
        }

        fs.readdirSync(dir).filter(filterFilenames).map(mapFiles).forEach(handleFileOrDirectory);
      }

      processDirectory(options.taskDirectory);
    }
  };
})();