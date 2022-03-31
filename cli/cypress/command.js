const { Command, Option } = require('commander');
const { RunCypress } = require('./run');

const removeCliArgs = (args, options) => {
    let cliArgsIgnoreIndex = -1;
    return args.reduce((args, arg, index) => {
        if (
            arg.startsWith('-') &&
            [...options, '-s', '--spec', '--config-plugin-path'].includes(arg)
        ) {
            cliArgsIgnoreIndex = index + 1;
            return args;
        }
        if (index === cliArgsIgnoreIndex && !arg.startsWith('-')) {
            cliArgsIgnoreIndex = index + 1;
            return args;
        }
        args.push(arg);
        return args;
    }, []);
};

const cypressRunCommand = (cli) =>
    new Command('run')
        .addOption(
            new Option(
                '--sessionId <sessionId>',
                'specify split-specs sessionId'
            ).makeOptionMandatory()
        )
        .addOption(
            new Option(
                '--project <project>',
                'specify project name'
            ).makeOptionMandatory()
        )
        .addOption(
            new Option(
                '--token <token>',
                'specify split-spec token'
            ).makeOptionMandatory()
        )
        .addOption(
            new Option(
                '--machineId <machineId>',
                'specify split-specs machineId'
            ).default('default')
        )
        .addOption(
            new Option(
                '--config-plugin-path [configPluginPath]',
                'optional plugins file to update config per specific spec'
            )
        )
        .allowUnknownOption()
        .action(async (options) => {
            const cliOptions = Object.keys(options).map((opt) => `--${opt}`);

            const cypressRunArgs = removeCliArgs(cli.args, cliOptions);

            const exitCode = await RunCypress(
                options,
                cypressRunArgs,
                options.configPluginPath
            );

            console.log(`Test runner process exit with code ${exitCode}`);
            process.exit(exitCode);
        });

module.exports = {
    cypressRunCommand
};
