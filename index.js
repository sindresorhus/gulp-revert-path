'use strict';
var through = require('through2');

module.exports = function () {
	return through.obj(function (file, enc, cb) {
		var history = file.history;

		if (history.length > 1) {
			history.pop();
			file.path = history[history.length - 1];
		}

		cb(null, file);
	});
};
