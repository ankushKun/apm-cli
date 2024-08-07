# APM CLI

The APM CLI is a command line interface for ao package manager to:
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