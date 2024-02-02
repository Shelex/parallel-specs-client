#!/usr/bin/env node
const dotenv = require('dotenv');
const { ParallelSpecsClient, filesToSpecInput } = require('../index');
const { spawn } = require('child_process');

dotenv.config();

// get number of executors, command and arguments
const [executors, cmd, ...args] = process.argv.slice(2);

// pass credentials and project
const client = new ParallelSpecsClient({
    project: process.env.PARALLEL_SPECS_PROJECT_NAME,
    token: process.env.PARALLEL_SPECS_API_KEY
});

// get all specs but ignore spec8
//const specs = filesToSpecInput(['**/specs/*.js'], ['**/spec8.js']);

// get all specs
const specs = filesToSpecInput(['**/specs/*.js']);

// create new session
const res = client.addSession(specs);

console.log(`created session ${res.sessionId}`);

let exitCode = 0;

function next(machineId) {
    const nextSpec = client.next({
        machineId,
        previousStatus: exitCode === 0 ? 'passed' : 'failed'
    });
    if (nextSpec) {
        process.stdout.write(
            `PICKING UP NEXT TASK (${nextSpec}) for machine ${machineId}\n`
        );

        return new Promise((resolve, reject) => {
            const arg = [...args, '--spec', nextSpec];
            const child_process = spawn(cmd, arg);

            child_process.on('exit', (code) => {
                return resolve(() => {
                    exitCode += code;
                });
            });
            child_process.on('error', (err) => {
                return reject(err);
            });
        });
    } else {
        return Promise.reject(`ALL SPECS PROCESSED for ${machineId}\n`);
    }
}

const executor = (machineId) => Promise.resolve((function recursive() {
    next(machineId)
        .then(recursive)
        .catch((e) => console.log(e));
})())

const runners = Array.from({ length: executors }, (_, v) =>
    executor(`machine${v + 1}`)
);

Promise.all(runners);

process.on('exit', () => {
    process.exit(exitCode);
});
