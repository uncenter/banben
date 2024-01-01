import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { test, expect } from 'vitest';

import { Package } from '../src/utils';

test('should match actual package.json data', async () => {
	const pkg = new Package(
		join(fileURLToPath(new URL('.', import.meta.url)), '../package.json'),
	);
	await pkg.read();
	expect(pkg.indent).toBe('\t');
	expect(pkg.eofChar).toBe('\n');
});
