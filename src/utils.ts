import { writeFile, readFile } from 'fs/promises';

import parse from 'json-parse-even-better-errors';

const kIndent = Symbol.for('indent');
const kNewline = Symbol.for('newline');

export async function writeJson(path: string, pkg: any) {
	const { [kIndent]: indent = 2, [kNewline]: newline = '\n' } = pkg;
	const raw = JSON.stringify(pkg, null, indent) + '\n';
	const data = newline === '\n' ? raw : raw.split('\n').join(newline);
	return await writeFile(path, data);
}

export async function readJson(path: string) {
	return parse(await readFile(path));
}
