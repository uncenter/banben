import { select, string } from 'prask';
import semverValid from 'semver/functions/valid.js';

export async function chooseVersion() {
	let version;
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
		searchable: true, // Turn off support for filtering the list of options
	});
	if (version === undefined) {
		version = await string({
			message: 'Enter a version number:',
			required: true,
			validate: (value) =>
				semverValid(value) || 'Value must be a valid semver version!',
		});
	}
	return version as string;
}
