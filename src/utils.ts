import type { JsonObject } from './types';
import type { Indent } from 'detect-indent';

import { readFile, stat, writeFile } from 'node:fs/promises';

import detectIndent from 'detect-indent';
import { Logger } from 'loogu';

export const log = new Logger('', {
	throwError: false,
});

export async function exists(path: string) {
	try {
		await stat(path);
		return true;
	} catch {
		return false;
	}
}

export class Package {
	path: string;
	json: JsonObject;
	indent: Indent['indent'];
	eofChar: string;

	constructor(path: string) {
		this.path = path;
	}

	async read() {
		if (this.json) return this.json;

		if (!(await exists(this.path)))
			log.error(`No package.json found in ${process.cwd()}.`);
		const file = await readFile(this.path, 'utf-8');

		try {
			this.json = JSON.parse(file);
		} catch {
			log.error('Failed to parse package.json.');
		}

		if (typeof this.json !== 'object') {
			log.error('Package.json is not an object.');
		}

		this.indent = detectIndent(file).indent;
		this.eofChar = (file.match(/\r?\n$/) || [])[0] || '';
		return this.json;
	}

	async write(json: typeof this.json) {
		await writeFile(
			this.path,
			JSON.stringify(json || this.json, undefined, this.indent) +
				this.eofChar,
		);
	}
}
