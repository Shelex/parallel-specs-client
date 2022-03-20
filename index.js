const SpecSplitClient = require('./splitter');
const filesToSpecInput = require('./filereader');
const runCypress = require('./cy-run/runner');

module.exports = {
    SpecSplitClient,
    filesToSpecInput,
    runCypress
};
