#!/usr/bin/env node

import { defineCommand, runMain } from 'citty';

import {
	name,
	version,
	description,
} from '../package.json' assert { type: 'json' };

import bump from '.';

const main = defineCommand({
	meta: {
		name: name,
		version: version,
		description: description,
	},
	args: {
		version: {
			type: 'positional',
			description:
				'[<version> | major | minor | patch | premajor | preminor | prepatch | prerelease]',
			required: false,
		},
	},
	async run({ args }) {
		await bump(args.version);
	},
});

runMain(main);
