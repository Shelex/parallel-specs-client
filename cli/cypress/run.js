const SpecSplitClient = require('../../splitter');
const fs = require('fs');
const path = require('path');

class SplitSpecsCypress {
    client; //SpecSplitClient;
    args; // CypressArgs
    machineId;
    previousSpecPassed = false;
    exitCode = 0;
    configPlugin; //Function to update config based on spec

    constructor(splitSpecInfo, cypressArgs, configPluginPath) {
        this.client = new SpecSplitClient({
            project: splitSpecInfo.project,
            token: splitSpecInfo.token,
            sessionId: splitSpecInfo.sessionId
        });
        this.machineId = splitSpecInfo.machineId;
        this.args = cypressArgs;

        const pluginPath =
            configPluginPath && path.resolve('.', configPluginPath);
        this.configPlugin = fs.existsSync(pluginPath) && require(pluginPath);
    }

    async cypressRun(spec) {
        try {
            const cypress = require('cypress');

            const config = await cypress.cli.parseRunArguments(this.args);

            const cyConfig = { ...config, ...{ spec } };

            this.updateConfigFn && this.updateConfigFn(cyConfig, spec);

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

const RunCypress = async (splitSpecInfo, cypressArgs, configFn) => {
    const runner = new SplitSpecsCypress(splitSpecInfo, cypressArgs, configFn);

    await runner.run();

    return runner.exitCode;
};

module.exports = { RunCypress };
