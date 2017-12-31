import {Buffer} from 'node:buffer';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'ava';
import Vinyl from 'vinyl';
import {pEvent} from 'p-event';
import transformStream from 'easy-transform-stream';
import revertPath from './index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test('reverts the path to the previous one', async t => {
	const s = transformStream({objectMode: true}, file => {
		t.is(path.extname(file.path), '.foo');
		file.extname = '.bar';
		t.is(path.extname(file.path), '.bar');
		t.is(file.history.length, 2);
		return file;
	});

	const promise = pEvent(s, 'end');

	s.pipe(revertPath()).pipe(transformStream({objectMode: true}, file => {
		t.is(path.extname(file.path), '.foo');
		t.is(path.extname(file.history[0]), '.foo');
		t.is(file.history.length, 1);
	}));

	s.end(new Vinyl({
		cwd: __dirname,
		base: path.join(__dirname, 'fixture'),
		path: path.join(__dirname, 'fixture/fixture.foo'),
		contents: Buffer.from(''),
	}));

	await promise;
});

test('reverts the path to the previous two', async t => {
	const s = transformStream({objectMode: true}, file => {
		t.is(path.extname(file.path), '.foo');
		file.extname = '.bar';
		t.is(path.extname(file.path), '.bar');
		file.extname = '.baz';
		t.is(path.extname(file.path), '.baz');
		t.is(file.history.length, 3);
		return file;
	});

	const promise = pEvent(s, 'end');

	s.pipe(revertPath(2)).pipe(transformStream({objectMode: true}, file => {
		t.is(path.extname(file.path), '.foo');
		t.is(path.extname(file.history[0]), '.foo');
		t.is(file.history.length, 1);
	}));

	s.end(new Vinyl({
		cwd: __dirname,
		base: path.join(__dirname, 'fixture'),
		path: path.join(__dirname, 'fixture/fixture.foo'),
		contents: Buffer.from(''),
	}));

	await promise;
});

test('successfully processes files with unmodified paths', async t => {
	const s = transformStream({objectMode: true}, file => {
		t.is(path.extname(file.path), '.foo');
		t.is(path.extname(file.history[0]), '.foo');
		t.is(file.history.length, 1);
		return file;
	});

	const promise = pEvent(s, 'end');

	s.pipe(revertPath()).pipe(transformStream({objectMode: true}, file => {
		t.is(path.extname(file.path), '.foo');
		t.is(path.extname(file.history[0]), '.foo');
		t.is(file.history.length, 1);
	}));

	s.end(new Vinyl({
		cwd: __dirname,
		base: path.join(__dirname, 'fixture'),
		path: path.join(__dirname, 'fixture/fixture.foo'),
		contents: Buffer.from(''),
	}));

	await promise;
});

test('reverts as much as possible', async t => {
	const s = transformStream({objectMode: true}, file => {
		t.is(path.extname(file.path), '.foo');
		file.extname = '.bar';
		t.is(path.extname(file.path), '.bar');
		file.extname = '.baz';
		t.is(path.extname(file.path), '.baz');
		t.is(file.history.length, 3);
		return file;
	});

	const promise = pEvent(s, 'end');

	s.pipe(revertPath(100)).pipe(transformStream({objectMode: true}, file => {
		t.is(path.extname(file.path), '.foo');
		t.is(path.extname(file.history[0]), '.foo');
		t.is(file.history.length, 1);
	}));

	s.end(new Vinyl({
		cwd: __dirname,
		base: path.join(__dirname, 'fixture'),
		path: path.join(__dirname, 'fixture/fixture.foo'),
		contents: Buffer.from(''),
	}));

	await promise;
});

test('reverts paths for differently deep files', async t => {
	const s = transformStream({objectMode: true}, file => {
		if (path.basename(file.path).startsWith('fixture')) {
			t.is(path.extname(file.path), '.foo');
			file.extname = '.bar';
			t.is(path.extname(file.path), '.bar');
			file.extname = '.baz';
			t.is(path.extname(file.path), '.baz');
			file.extname = '.qux';
			t.is(path.extname(file.path), '.qux');
		} else {
			t.is(path.extname(file.path), '.corge');
			file.extname = '.grault';
			t.is(path.extname(file.path), '.grault');
			file.extname = '.garply';
			t.is(path.extname(file.path), '.garply');
		}

		t.is(file.history.length, path.basename(file.path).startsWith('fixture') ? 4 : 3);

		return file;
	});

	const promise = pEvent(s, 'end');

	s.pipe(revertPath(1)).pipe(transformStream({objectMode: true}, file => {
		t.is(path.extname(file.path), path.basename(file.path).startsWith('mixture') ? '.grault' : '.baz');
		return file;
	})).pipe(revertPath(1)).pipe(transformStream({objectMode: true}, file => {
		t.is(path.extname(file.path), path.basename(file.path).startsWith('mixture') ? '.corge' : '.bar');
		return file;
	})).pipe(revertPath(1)).pipe(transformStream({objectMode: true}, file => {
		t.is(path.extname(file.path), path.basename(file.path).startsWith('mixture') ? '.corge' : '.foo');
	}));

	s.write(new Vinyl({
		cwd: __dirname,
		base: path.join(__dirname, 'fixture'),
		path: path.join(__dirname, 'fixture/mixture.corge'),
		contents: Buffer.from(''),
	}));

	s.write(new Vinyl({
		cwd: __dirname,
		base: path.join(__dirname, 'fixture'),
		path: path.join(__dirname, 'fixture/fixture.foo'),
		contents: Buffer.from(''),
	}));

	s.end();

	await promise;
});
