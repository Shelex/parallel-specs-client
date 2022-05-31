const SpecSplitClient = require('./splitter');
const filesToSpecInput = require('./filereader');
const { runCypress } = require('./cli/cypress/run');

module.exports = {
    SpecSplitClient,
    filesToSpecInput,
    runCypress
};
