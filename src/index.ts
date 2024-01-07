import type { ReleaseType } from 'semver';

import { resolve } from 'node:path';

import { execa as shell } from 'execa';
import { cyan, magenta } from 'kleur/colors';
import { select, string, toggle } from 'prask';
import { inc, parse, valid } from 'semver';

import { log, Package } from './utils';

export default async function (version: ReleaseType | string | undefined) {
	const pkg = new Package(resolve('./package.json'));
	const json = await pkg.read();

	try {
		await shell('git', ['rev-parse', '--is-inside-work-tree']);
	} catch {
		log.error('Not in a Git repository.');
	}

	const currentBranch = await shell('git', ['branch', '--show-current']).then(
		(result) => result.stdout,
	);

	const remoteOrigin = (await shell('git', ['remote', 'show', 'origin']).then(
		(result) => result.stdout,
		() => false,
	)) as string | false;

	if (remoteOrigin) {
		const defaultBranch = remoteOrigin
			.split('\n')
			.find((line) => line.includes('HEAD branch'))
			.split(' ')[4];

		if (
			currentBranch !== defaultBranch &&
			!(await toggle({
				message: `The default branch at remote ${magenta(
					'origin',
				)} is ${cyan(defaultBranch)}, but you are on ${cyan(
					currentBranch,
				)}. Would you like to proceed on branch ${cyan(
					currentBranch,
				)} anyway?`,
			}))
		) {
			log.error('Operation cancelled.');
		}
	} else {
		log.error('Remote origin does not exist. Operation cancelled.');
	}

	log.info(`Current version is ${json.version}.`);

	if (json.version === undefined) {
		json.version =
			version ||
			(await string({
				message: 'No version set. Enter an initial version number:',
				validate: (value) =>
					value
						? valid(value)
							? true
							: 'Value must be a valid semver version!'
						: 'Please provide a value.',
			}));
	} else if (version === undefined) {
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

		json.version = [
			'major',
			'premajor',
			'minor',
			'preminor',
			'patch',
			'prepatch',
			'prerelease',
		].includes(version)
			? inc(json.version as string, version as ReleaseType)
			: parse(version).version;
	}

	try {
		const status = await shell('git', ['status', '-s']);
		if (status.stdout !== '' && status.stdout.split('\n').length > 0) {
			log.error(
				'Changed files detected. Please commit any staged/unstaged changed files before running `banben`.',
			);
		}
	} catch {
		log.error('Something went wrong while checking for changed files.');
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

	if (
		await toggle({
			message: `Push version tag and commit to ${magenta(
				'origin',
			)}/${cyan(currentBranch)}?`,
			initial: false,
		})
	) {
		try {
			await shell('git', ['push', 'origin', 'v' + json.version]);
			await shell('git', ['push', 'origin', currentBranch]);
		} catch {
			log.error('Something went wrong while pushing the tag and commit.');
		}
		log.success('Tag and commit pushed.');
	} else {
		log.error('Tag and commit push cancelled.');
	}
}
