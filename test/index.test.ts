import { test, expect } from 'vitest';
import { Package } from '../src/utils';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

test('', async () => {
	const pkg = new Package(
		join(dirname(fileURLToPath(import.meta.url)), '../package.json'),
	);
	await pkg.read();
	expect(pkg.indent).toBe('\t');
	expect(pkg.eofChar).toBe('\n');
});
