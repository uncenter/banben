import { resolve } from 'node:path';
import { execSync } from 'node:child_process';

import { ReleaseType } from 'semver';
import semverIncrement from 'semver/functions/inc.js';
import semverValid from 'semver/functions/valid.js';
import semverParse from 'semver/functions/parse.js';

import { toggle, string } from 'prask';

import { log } from '../..';
import { writeJson, readJson } from '../../utils';
import { chooseVersion } from './choose';

export default async function (version: ReleaseType | string | undefined) {
	if (version === undefined) version = await chooseVersion();
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

	if (
		await toggle({
			message: `Write version '${pkgJson.version}' to package.json?`,
			initial: true,
		})
	) {
		await writeJson(pkgJsonPath, pkgJson);
		log.success(`Version written to package.json.`);
	}

	if (
		await toggle({
			message: `Commit version '${pkgJson.version}'?`,
			initial: true,
		})
	) {
		const versionString = await string({
			message: 'Commit message:',
			initial: `v${pkgJson.version}`,
			required: true,
			validate: (value) =>
				value.length > 0 || 'Please provide a commit message.',
		});
		execSync(`git add ${pkgJsonPath}`);
		execSync(`git commit -m "${versionString}"`);
		log.success(`Committed version changes.`);

		if (
			await toggle({
				message: 'Create tag?',
				initial: true,
			})
		) {
			const commit = execSync(`git log -n 1 --pretty=format:"%H"`);
			execSync(`git tag -a ${versionString} ${commit} -m ""`);
		}
	}
}
