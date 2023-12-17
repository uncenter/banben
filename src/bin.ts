#!/usr/bin/env node

import bin from 'tiny-bin';

import bump from '.';

bin('banben', 'A better `npm version`.')
	.argument(
		'[<version> | major | minor | patch | premajor | preminor | prepatch | prerelease]',
		'',
	)
	.action((options, args) => bump(args[0]))
	.run();
