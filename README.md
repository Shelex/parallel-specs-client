# split-specs-client

![Build][gh-image]
[![version][version-image]][npm-url]  
[![semantic-release][semantic-image]][semantic-url]
[![License][license-image]][license-url]

API Client library for [Split specs](https://github.com/Shelex/split-specs).  
Service could be used as orchestrator for your spec files during parallel testing across different machines/containers.

## Install

-   yarn:

```bash
yarn add @shelex/split-specs-client
```

-   npm:

```bash
npm install @shelex/split-specs-client
```

## Example

```js
import { SpecSplitClient, filesToSpecInput } from '@shelex/split-specs-client';
// const { SpecSplitClient, filesToSpecInput } = require("@shelex/split-specs-client")

const client = new SpecSplitClient({
    project: 'test',
    email: 'admin@example.com',
    password: 'admin'
});

/**
 * specs are located in folder "specs"
 * files: "spec1.js", "spec2.js", "spec3.js", "spec5.js", "spec4.js"
 * take all js files in "specs" folder excepting "spec5.js"
 */
const specs = filesToSpecInput(['**/specs/*.js'], ['**/specs/spec5.js']);

// create new session (project will be created automatically, or link existing)
client.addSession(specs);
// or in case you have files as strings just pass them as array of objects:
// const specs = [{ filePath: 'spec1.js' }, { filePath: 'spec2.js' }, { filePath: 'spec3.js' }, { filePath: 'spec4.js' }]
// client.addSession(specs)

// query next spec for any of your runners
const next = client.nextSpec({ machineId: 'runner1' }); // start spec1, return spec1
const next = client.nextSpec({ machineId: 'runner2' }); // start spec2, return spec2
const next = client.nextSpec({ machineId: 'runner2' }); // finish spec2, start spec3, return spec3
const next = client.nextSpec({ machineId: 'runner1' }); // finish spec1, start spec4, return spec4
const next = client.nextSpec({ machineId: 'runner2' }); // finish spec3, return null
const next = client.nextSpec({ machineId: 'runner1' }); // finish spec4, return null

// get current state of project "test"
const project = client.project();
console.log(project);
```

## CLI

Library also provides CLI interface

### Create session

`split-specs-cli create-session --project test --token $split_spec_token --include-specs '**/cypress/integration/**'`

Use `split-specs-cli create-session --help` to check arguments available  
Created session will be stored as json file or just `console.log` session id to catch from bash:

```
SPLIT_SPEC_SESSION_ID=$(split-spec-cli create-session (args for split spec client) | tail -1)
```

### Run Cypress

`split-specs-cli run --project test -token $split_spec_token --sessionId $split_spec_sessionId --machineId $split_spec_machineId ...cypress run args`

with some cypress args:
`split-specs-cli run --project sample -token sample --sessionId sample --machineId sample --env allure=true --browser chrome`

with plugin to manipulate configuration `function(config, specName):config`
`split-specs-cli run --project sample -token sample --sessionId sample --machineId sample --config-plugin-path './updateConfig.js' --env allure=true --browser chrome`

You can have multiple machines\actions\containers with such runner (with different `machineId`) and each runner will ask service for next spec file to execute.

## Registration

You can register your account at [split-specs UI](http://split-specs.appspot.com)
by executing query:

```gql
mutation {
    register(input: { email: "email@example.com", password: "password" })
}
```

More documentation regarding available API is in [split-specs](https://github.com/Shelex/split-specs) repository.

## API

### `const client = new SpecSplitClient({options})`

Constructor. `options` may contain inital values for:

-   `url`, default: "http://split-specs.appspot.com/query"; url for split-specs service queries
-   `project`, may be also passed as second argument to `addSession`
-   `token`, in case you have obtained token in web version (valid for 24h) or other way, it could be passed so login step will be skipped
-   `email` and `password`, in case token option is empty, constructor will call login method with this credentials to obtain token

### `client.addSession(specs: SpecInput[], projectName?: string): {sessionId: string}`

Create a new session for project. Project will be reused, or created in case it still not exist.  
Returns object with property sessionID that could be used for retrieving spec.

### `client.nextSpec({ machineId?: string, sessionId?: string, isPassed?: boolean }): string;`

Get next spec for machineId + sessionId, returns spec filePath.  
Ends previous spec for this machineId + sessionId in case it exists.

### `project(name?: string): Project`

Get project details with all sessions conducted

## Motivation

Idea is to have separate service for orchestrating specs during test runs. Classical solution is to manually split spec files in groups, however it may be not so efficient in terms of run duration. Strategy used in this service is basically to run new specs and then from longest to shortest compared to previous session.  
Potentially, some UI could be built on top of [Split specs](https://github.com/Shelex/split-specs) service to track test sessions across the time.

## License

Copyright © 2021 Oleksandr Shevtsov <ovr.shevtsov@gmail.com>

This work is free. You can redistribute it and/or modify it under the
terms of the [MIT License](https://opensource.org/licenses/MIT).
See LICENSE for full details.

[npm-url]: https://npmjs.com/package/@shelex/split-specs-client
[gh-image]: https://github.com/Shelex/split-specs-client/workflows/build/badge.svg?branch=master
[semantic-image]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-url]: https://github.com/semantic-release/semantic-release
[license-image]: https://img.shields.io/npm/l/@shelex/split-specs-client
[license-url]: https://opensource.org/licenses/MIT
[version-image]: https://badgen.net/npm/v/@shelex/split-specs-client
