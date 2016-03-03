'use strict';
var through = require('through2');

module.exports = function (reversions) {
	reversions = typeof reversions === 'number' ? reversions : 1;

	return through.obj(function (file, enc, cb) {
		var history = file.history;
		var highestIndex = history.length - 1;
		var localReversions = reversions;

		if (localReversions > highestIndex)
			localReversions = highestIndex;

		history.splice(-localReversions, localReversions);
		file.path = history[history.length - 1];

		cb(null, file);
	});
};
