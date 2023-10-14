import { execa as shell } from 'execa';
import { resolve } from 'node:path';
import { log } from './bin';

import { select, string, toggle } from 'prask';
import { inc, parse, valid, type ReleaseType } from 'semver';

import { Package } from './utils';

export default async function (version: ReleaseType | string | undefined) {
	const pkg = new Package(resolve('./package.json'));
	const json = await pkg.read();

	log.info(`Current version is ${json.version}.`);

	if (version === undefined) {
		version = await select({
			message: 'Select a version increment:',
			options: [
				{ title: 'Major', value: 'major' },
				{ title: 'Minor', value: 'minor' },
				{ title: 'Patch', value: 'patch' },
				{ title: 'Premajor', value: 'premajor' },
				{ title: 'Prepatch', value: 'prepatch' },
				{ title: 'Prerelease', value: 'prerelease' },
				{ title: 'Other...', value: undefined },
			],
			searchable: true,
		});
		if (!version) {
			version = await string({
				message: 'Enter a version number:',
				validate: (value) =>
					value
						? valid(value)
							? true
							: 'Value must be a valid semver version!'
						: 'Please provide a value.',
			});
		}
	}

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
		json.version = inc(json.version as string, version as ReleaseType);
	} else if (valid(version)) {
		json.version = parse(version).version;
	} else {
		log.error(`Invalid version ${JSON.stringify(version)}.`);
	}

	if (
		await toggle({
			message: `Write version '${json.version}' to package.json?`,
		})
	) {
		await pkg.write(json);
		log.success('Wrote version to package.json.');
	} else {
		log.error('Version write cancelled.');
	}

	if (
		await toggle({
			message: `Commit version '${json.version}'?`,
			initial: true,
		})
	) {
		const message = await string({
			message: 'Commit message:',
			initial: `v${json.version}`,
			validate: (value) => !!value || 'Please provide a commit message.',
		});
		if (!message) log.error('Commit cancelled.');

		try {
			await shell('git', ['add', '.']);
			await shell('git', ['commit', '-m', message]);
		} catch {
			log.error('Something went wrong while making the commit.');
		}
		log.success('Commit created.');
	} else {
		log.error('Commit cancelled.');
	}

	if (
		await toggle({
			message: 'Create tag?',
			initial: true,
		})
	) {
		try {
			const hash = JSON.parse(
				(await shell('git', [
					'log',
					'-n',
					'1',
					'--pretty=format:"%H"',
				]).then((result) => result.stdout)) || '""',
			);

			if (!hash) log.error('No commit hash found!');

			await shell('git', [
				'tag',
				'-a',
				`v${json.version}`,
				hash,
				'-m',
				'""',
			]);
		} catch {
			log.error('Something went wrong while creating the tag.');
		}
		log.success('Tag created.');
	} else {
		log.error('Tag creation cancelled.');
	}
}
