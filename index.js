'use strict';
const through = require('through2');

module.exports = (reversions = 1) => {
	return through.obj((file, encoding, callback) => {
		const {history} = file;
		const highestIndex = history.length - 1;
		let localReversions = reversions;

		if (localReversions > highestIndex) {
			localReversions = highestIndex;
		}

		history.splice(-localReversions, localReversions);
		file.path = history[history.length - 1];

		callback(null, file);
	});
};
