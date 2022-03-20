const fs = require('fs');
const parseGlobPatterns = (str) => (str && str.length ? str.split(',') : []);

const cyJsonPath = '../../cypress.json';
const readCyConfig = () => {
    const cfg = {
        ignore: [],
        include: []
    };

    if (!fs.existsSync(cyJsonPath)) {
        return cfg;
    }
    const cypressJson = require();

    if (!cypressJson) {
        return cfg;
    }

    if (cypressJson.ignoreTestFiles) {
        const { ignoreTestFiles } = cypressJson;
        cfg.ignore = Array.isArray(ignoreTestFiles)
            ? ignoreTestFiles
            : parseGlobPatterns(ignoreTestFiles);
    }

    if (cypressJson.testFiles) {
        const { testFiles } = cypressJson;
        cfg.include = Array.isArray(testFiles)
            ? testFiles
            : parseGlobPatterns(testFiles);
    }
    return cfg;
};

module.exports = {
    parseGlobPatterns,
    readCyConfig
};
