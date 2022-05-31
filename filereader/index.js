const glob = require('fast-glob');
const minimatch = require('minimatch')

const findSpecFiles = (includes = [], excludes = []) => {
    const files = includes.reduce((files, pattern) => {
        const patternFiles = glob.sync(pattern, {
            onlyFiles: true,
            suppressErrors: true,
            ignore: '**/node_modules/**'
        });
        files.push(...patternFiles);
        return files;
    }, []);

    const uniqueFilesSet = new Set(files);

    const uniqueFiles = Array.from(uniqueFilesSet);

    return uniqueFiles.filter(
        (file) =>
            !excludes.some((exclude) =>
                minimatch(file, exclude, { matchBase: true })
            )
    );
};

module.exports = findSpecFiles;
