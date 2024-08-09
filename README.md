# APM CLI TOOL

![Static Badge](https://img.shields.io/badge/apm--tool-a?style=flat&logo=npm&logoColor=red&color=lightgreen&link=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fapm-tool)
[![downloads](https://img.shields.io/npm/dt/apm-tool?color=lightgreen)](https://www.npmjs.com/package/apm-tool)
[![X Follow](https://img.shields.io/twitter/follow/betteridea_dev)](https://twitter.com/betteridea_dev)

The `apm-tool` is a command line interface for ao package manager to:
- Initialise new package boilerplate
- Register a new vendor name
- Register a new package
- Update an existing package
- Download a package locally

## Installation

```shell
npm i -g apm-tool
```

## Usage

```shell
apm <command> [arguments]
```

## Commands

- `init` - Create a new package boilerplate
- `register-vendor` - Register a new vendor name or package
- `publish` - Publish a new package
- `update` - Update an existing package
- `download` - Download a package locally

### `init`

> TODO

### `register-vendor`

> TODO

### `publish`

> TODO

### `update`

> TODO

### `download`

```shell
apm download <@vendor/package@version>
```

this will download the package locally in the `apm_modules` directory.