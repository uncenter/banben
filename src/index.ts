#!/usr/bin/env node

import bin from 'tiny-bin';

import bump from './bump';

import { Logger } from 'loogu';
export const log = new Logger('', { throwError: false });

bin('banben', '')
	.action(() => {
		log.error(
			'No command specified. Run `banben help [command]` or `banben --help`.',
		);
	})
	.command('bump', 'Bump the package.json version')
	.argument(
		'[<version> | major | minor | patch | premajor | preminor | prepatch | prerelease]',
		'The new version',
	)
	.action((options, args) => bump(args[0]))
	.run();
