import {gulpPlugin} from 'gulp-plugin-extras';

export default function gulpRevertPath(reversionCount = 1) {
	return gulpPlugin('gulp-revert-path', file => {
		const {history} = file;
		const highestIndex = history.length - 1;
		let localReversions = reversionCount;

		if (localReversions > highestIndex) {
			localReversions = highestIndex;
		}

		history.splice(-localReversions, localReversions);
		file.path = history.at(-1);

		return file;
	}, {
		supportsAnyType: true,
	});
}
