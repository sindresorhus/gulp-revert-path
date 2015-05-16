'use strict';
var through = require('through2');

module.exports = function () {
	return through.obj(function (file, enc, cb) {
		file.history.pop();
		file.path = file.history.pop();
		cb(null, file);
	});
};
