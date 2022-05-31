#!/usr/bin/env node
const { SpecSplitClient, filesToSpecInput } = require('../index');
const { spawn } = require('child_process');

// get number of executors, command and arguments
const [executors, cmd, ...args] = process.argv.slice(2);

// pass credentials and project
const client = new SpecSplitClient({
    project: 'test',
    email: 'test@test.com',
    password: 'test'
});

// get all specs but ignore spec8
const specs = filesToSpecInput(['**/specs/*.js'], ['**/spec8.js']);

// create new session
const res = client.addSession(specs);

console.log(`created session ${res.sessionId}`);

let exitCode = 0;

function next(machineID) {
    const nextSpec = client.nextSpec({
        machineId: machineID,
        previousStatus: exitCode === 0 ? 'passed' : 'failed'
    });
    if (nextSpec) {
        process.stdout.write(
            `PICKING UP NEXT TASK (${nextSpec}) for machine ${machineID}\n`
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
        return Promise.reject(`ALL SPECS PROCESSED for ${machineID}\n`);
    }
}

const executor = (machineID) => {
    return new Promise((resolve) => {
        resolve(
            (function recursive() {
                next(machineID)
                    .then(recursive)
                    .catch((e) => console.log(e));
            })()
        );
    });
};

const runners = Array.from({ length: executors }, (_, v) =>
    executor(`machine${v + 1}`)
);

Promise.all(runners);

process.on('exit', () => {
    process.exit(exitCode);
});
