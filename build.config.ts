import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
	entries: ['./src/bin'],
	declaration: false,
	rollup: {
		esbuild: {
			minify: true,
		},
	},
});
