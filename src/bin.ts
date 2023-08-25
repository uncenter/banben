#!/usr/bin/env node

import bin from 'tiny-bin';

import bump from '.';

import { Logger } from 'loogu';
export const log = new Logger('', {
	throwError: false,
});

bin('banben', 'A better `npm version`.')
	.argument(
		'[<version> | major | minor | patch | premajor | preminor | prepatch | prerelease]',
		'',
	)
	.action((options, args) => bump(args[0]))
	.run();
