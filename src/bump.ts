import { resolve } from 'node:path';

import { ReleaseType } from 'semver';
import semverIncrement from 'semver/functions/inc.js';
import semverValid from 'semver/functions/valid.js';
import semverParse from 'semver/functions/parse.js';

import { log } from '.';
import { writeJson, readJson } from './utils';

export default async function (version: ReleaseType | string) {
	const pkgJsonPath = resolve('./package.json');
	const pkgJson = await readJson(pkgJsonPath);

	if (
		[
			'major',
			'premajor',
			'minor',
			'preminor',
			'patch',
			'prepatch',
			'prerelease',
		].includes(version)
	) {
		pkgJson.version = semverIncrement(pkgJson.version, version as ReleaseType);
	} else if (semverValid(version)) {
		pkgJson.version = semverParse(version).version;
	} else {
		log.error(`Invalid version ${JSON.stringify(version)}.`);
	}

	await writeJson(pkgJsonPath, pkgJson);
	log.success(pkgJson.version);
}
