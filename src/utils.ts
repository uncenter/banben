import detectIndent, { type Indent } from 'detect-indent';
import { readFile, writeFile } from 'fs/promises';
import type { JsonObject } from './types';

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

		const file = await readFile(this.path, 'utf-8');
		this.indent = detectIndent(file).indent;
		this.eofChar = (file.match(/\r?\n$/) || [])[0] || '';
		this.json = JSON.parse(file);
		return this.json;
	}

	async write(json: typeof this.json) {
		await writeFile(
			this.path,
			JSON.stringify(json || this.json, undefined, this.indent) + this.eofChar,
		);
	}
}
