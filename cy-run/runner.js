const SpecSplitClient = require('../splitter');

const RunCypress = (splitSpecInfo, cypressConfig, configFn) => {
    const cypress = require('cypress');

    const machineId = splitSpecInfo.machineId;
    let previousSpecPassed = true;

    const client = new SpecSplitClient({
        project: splitSpecInfo.project,
        token: splitSpecInfo.token,
        sessionId: splitSpecInfo.sessionId
    });

    process.exitCode = 0;

    const cypressTask = (spec) => {
        return new Promise((resolve, reject) => {
            const cyConfig = { ...cypressConfig, ...{ spec } };

            if (configFn) {
                configFn(cyConfig, spec);
            }

            cypress
                .run(cyConfig)
                .then((results) => {
                    process.exitCode += results.totalFailed || 0;
                    previousSpecPassed = !results.totalFailed;
                    resolve(results);
                })
                .catch((err) => {
                    console.log(err);
                    process.exitCode === 0 && (process.exitCode = 1);
                    previousSpecPassed = false;
                    reject(err);
                });
        });
    };

    function next(machineId) {
        const nextSpec = client.nextSpec({
            machineId: machineId,
            isPassed: previousSpecPassed
        });
        if (nextSpec) {
            console.log(
                `Got next spec to run (${nextSpec}) for machine ${machineId}`
            );
            return cypressTask(nextSpec);
        } else {
            return Promise.reject(`All specs are finished for ${machineId}`);
        }
    }

    // execute cypress run recursively taking next test from existing files
    (function recursive() {
        next(machineId)
            .then(recursive)
            .catch((e) => console.log(e))
            .finally(() => {
                if (process.exitCode || 0 > 0) {
                    throw new Error(
                        `Test runner process exit with code ${process.exitCode}`
                    );
                }
                console.log(
                    `Test runner process exit with code ${process.exitCode}`
                );
            });
    })();
};

module.exports = RunCypress;
