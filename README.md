# parallel-specs-client

![Build][gh-image]
[![version][version-image]][npm-url]  
[![semantic-release][semantic-image]][semantic-url]
[![License][license-image]][license-url]

API Client for [Parallel Specs](https://github.com/Shelex/parallel-specs).  
Service could be used as orchestrator for your spec files during parallel testing across different machines/containers.

## Authorization

### Registration

You can register your account at [parallel-specs UI](https://parallel-specs.shelex.dev)
or use demo credentials - email: `test@test.com` and password: `test`.  
Source code: [parallel-specs](https://github.com/Shelex/parallel-specs).

### Login

If you already have account at [parallel-specs UI](https://parallel-specs.shelex.dev) you can use email and password with this api client to obtain authorization token. Another way is to create specific api key (recommended) to avoid sharing credentials.

## Install

-   yarn:

```bash
yarn add @shelex/parallel-specs-client
```

-   npm:

```bash
npm install @shelex/parallel-specs-client
```

## Example

```js
import { ParallelSpecsClient, filesToSpecInput } from '@shelex/parallel-specs-client';
// const { ParallelSpecsClient, filesToSpecInput } = require("@shelex/parallel-specs-client")

const client = new ParallelSpecsClient({
    project: 'test',
    email: 'test@test.com',
    password: 'test'
    // or just use api key (email and password are not required in such case):
    token: 'api_key'
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
const next = client.next({ machineId: 'runner1' }); // start spec1, return spec1
const next = client.next({ machineId: 'runner2' }); // start spec2, return spec2
const next = client.next({ machineId: 'runner2' }); // finish spec2, start spec3, return spec3
const next = client.next({ machineId: 'runner1' }); // finish spec1, start spec4, return spec4
const next = client.next({ machineId: 'runner2' }); // finish spec3, return null
const next = client.next({ machineId: 'runner1' }); // finish spec4, return null

// get current state of project "test"
const project = client.project();
console.log(project);
```

## CLI

Library also provides CLI interface

### Create session

`parallel-specs-cli create-session --project test --token $parallel_spec_token --include-specs '**/cypress/integration/**'`

Use `parallel-specs-cli create-session --help` to check arguments available  
Created session will be stored as json file or just `console.log` session id to catch from bash:

```
PARALLEL_SPECS_SESSION_ID=$(parallel-specs-cli create-session (args for parallel spec client) | tail -1)
```

## API

### `const client = new ParallelSpecsClient({options})`

Constructor. `options` may contain inital values for:

-   `url`, default: "https://parallel-specs.shelex.dev/api"; url for parallel-specs service queries
-   `project`, may be also passed as second argument to `addSession`
-   `token`, in case you have already obtained api key, login step will be skipped
-   `email` and `password`, in case token option is empty, constructor will call login method with this credentials to obtain token

### `client.addSession(specs: SpecInput[], projectName?: string): {sessionId: string}`

Create a new session for project. Project will be reused, or created in case it still not exist.  
Returns object with property sessionID that could be used for retrieving spec.

### `client.next({ machineId?: string, sessionId?: string, previousStatus?: string }): string;`

Get next spec for machineId + sessionId, returns spec filePath.  
Ends previous spec for this machineId + sessionId in case it exists.

### `project(id?: string): Project`

Get project details with latest 15 sessions

## Run Cypress

Prepare a script that uses [Cypress module API](https://docs.cypress.io/guides/guides/module-api), examples could be found in [cypress-parallel-specs-locally](https://github.com/Shelex/cypress-parallel-specs-locally) repository.

You can have multiple machines\actions\containers with such runner (with different `machineId`) and each runner will ask service for next spec file to execute.

## Motivation

Idea is to have separate service for orchestrating specs during test runs. Classical solution is to manually divide spec files in groups, however it may be not so efficient in terms of run duration as you have to edit such timings, and one group may finish long after another one thus execution time is unoptimised. Strategy used in this service is basically to run new specs and then from longest to shortest compared to previous session.  
Potentially, some UI could be built on top of [Parallel Specs](https://github.com/Shelex/parallel-specs) service to track test sessions across the time.

## License

Copyright © 2022-2024 Oleksandr Shevtsov <ovr.shevtsov@gmail.com>

This work is free. You can redistribute it and/or modify it under the
terms of the [MIT License](https://opensource.org/licenses/MIT).
See LICENSE for full details.

[npm-url]: https://npmjs.com/package/@shelex/parallel-specs-client
[gh-image]: https://github.com/Shelex/parallel-specs-client/workflows/build/badge.svg?branch=master
[semantic-image]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-url]: https://github.com/semantic-release/semantic-release
[license-image]: https://img.shields.io/npm/l/@shelex/parallel-specs-client
[license-url]: https://opensource.org/licenses/MIT
[version-image]: https://badgen.net/npm/v/@shelex/parallel-specs-client
