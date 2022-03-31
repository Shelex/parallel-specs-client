const SpecSplitClient = require('../splitter');

class SplitSpecsCypress {
    client; //SpecSplitClient;
    config; // CypressConfig
    machineId;
    previousSpecPassed = false;
    exitCode = 0;
    updateConfigFn; //Function to update config based on spec

    constructor(splitSpecInfo, cypressConfig, updateConfigFn) {
        this.client = new SpecSplitClient({
            project: splitSpecInfo.project,
            token: splitSpecInfo.token,
            sessionId: splitSpecInfo.sessionId
        });
        this.config = cypressConfig;
        this.machineId = splitSpecInfo.machineId;
        this.updateConfigFn = updateConfigFn;
    }

    async cypressRun(spec) {
        const cyConfig = { ...this.config, ...{ spec } };

        this.updateConfigFn && this.updateConfigFn(cyConfig, spec);

        try {
            const cypress = require('cypress');
            const results = await cypress.run(cyConfig);

            return results.status === 'finished' ? results.totalFailed : 1;
        } catch (e) {
            console.log(e);
            return 1;
        }
    }

    async next() {
        const nextSpec = this.client.nextSpec({
            machineId: this.machineId,
            isPassed: this.previousSpecPassed
        });

        if (!nextSpec) {
            console.log(`All specs are finished for ${this.machineId}`);
            return -1;
        }

        console.log(
            `Got next spec to run (${nextSpec}) for machine ${this.machineId}`
        );
        return this.cypressRun(nextSpec);
    }

    async run() {
        const currentCode = await this.next();

        if (currentCode === -1) {
            return this.exitCode;
        }

        this.previousSpecPassed = currentCode === 0;
        this.exitCode += currentCode;

        return this.run();
    }
}

const RunCypress = async (splitSpecInfo, cypressConfig, configFn) => {
    const runner = new SplitSpecsCypress(
        splitSpecInfo,
        cypressConfig,
        configFn
    );

    await runner.run();

    return runner.exitCode;
};

module.exports = RunCypress;
