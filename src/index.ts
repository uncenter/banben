#!/usr/bin/env node

import { bin } from 'specialist';
import { Logger } from 'loogu';

import bump from './bump';
export const log = new Logger('', { throwError: false });

bin('bulto', '')
	.action(() => {
		log.info('Hello, world!');
	})
	.command('bump', 'Bump the package.json version')
	.argument(
		'[<version> | major | minor | patch | premajor | preminor | prepatch | prerelease]',
		'The new version',
	)
	.action((options, args) => bump(args[0]))
	.run();
