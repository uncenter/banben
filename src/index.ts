import { execa as shell } from 'execa';
import { resolve } from 'node:path';
import { log } from './bin';

import { select, string, toggle } from 'prask';
import { inc, parse, valid, type ReleaseType } from 'semver';

import { Package } from './utils';

export default async function (version: ReleaseType | string | undefined) {
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
					!value
						? 'Please provide a value.'
						: !valid(value)
						? 'Value must be a valid semver version!'
						: true,
			});
		}
	}

	const pkg = new Package(resolve('./package.json'));
	const json = await pkg.read();

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

		if (
			await toggle({
				message: `Commit version '${json.version}'?`,
				initial: true,
			})
		) {
			const commitMsg = await string({
				message: 'Commit message:',
				initial: `v${json.version}`,
				validate: (value) => !!value || 'Please provide a commit message.',
			});
			if (!commitMsg) log.error('Commit cancelled.');

			try {
				await shell('git', ['add', '.']);
				await shell('git', ['commit', '-m', commitMsg]);
			} catch {
				log.error('Something went wrong while making the commit.');
			}

			if (
				await toggle({
					message: 'Create tag?',
					initial: true,
				})
			) {
				try {
					const commitHash = JSON.parse(
						(await shell('git', [
							'log',
							'-n',
							'1',
							'--pretty=format:"%H"',
						]).then((result) => result.stdout)) || '""',
					);

					if (!commitHash) log.error('No commit hash found!');

					await shell('git', [
						'tag',
						'-a',
						`v${json.version}`,
						commitHash,
						'-m',
						'""',
					]);
				} catch {
					log.error('Something went wrong while creating the tag.');
				}
			}
		}
	}
}
