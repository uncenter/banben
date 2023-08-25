#!/usr/bin/env node

import bin from 'tiny-bin';

import bump from '.';

import { Logger } from 'loogu';
export const log = new Logger('', { throwError: false });

bin('banben', 'A better `npm version`.')
	.action(() => {
		log.error(
			'No command specified. Run `banben help [command]` or `banben --help`.',
		);
	})
	.argument(
		'[<version> | major | minor | patch | premajor | preminor | prepatch | prerelease]',
		'',
	)
	.action((options, args) => bump(args[0]))
	.run();
