import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { test, expect } from 'vitest';

import { Package } from '../src/utils';

test('should match actual package.json data', async () => {
	const pkg = new Package(
		join(dirname(fileURLToPath(import.meta.url)), '../package.json'),
	);
	await pkg.read();
	expect(pkg.indent).toBe('\t');
	expect(pkg.eofChar).toBe('\n');
});
