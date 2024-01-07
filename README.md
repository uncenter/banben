# banben

A better `npm version`. This tool is exactly what I want in a version-bumping tool, nothing more and nothing less. You probably shouldn't use this! Check out [fabiospampinato/bump](https://github.com/fabiospampinato/bump) for something more configurable.

> [!TIP]
> The word "banben" comes from the Chinese word `版本` (bǎnběn), meaning "version"!

## Installation

```sh
npm -g i banben
pnpm -g add banben
yarn -g add banben
bun -g add banben
```

## Usage

```sh
banben [<version> | major | minor | patch | premajor | preminor | prepatch | prerelease]
```

Banben runs through three steps, and prompts you along the way to confirm each action:

1. Write the version to the package.json.
2. Make a commit for the version (message defaults to the `v${version}`).
3. Create a version tag.
4. Push the version tag and commit.

## License

[MIT](LICENSE)
