#!/usr/bin/env node
const { Option, Command, InvalidOptionArgumentError } = require('commander');
const ParallelSpecsClient = require('../splitter');
const readSpecFiles = require('../filereader');
const fs = require('fs');

const cli = new Command();

// parallel-specs-cli create-session (args for parallel spec client)
cli.command('create-session')
    .addOption(new Option('-p, --project <string>').makeOptionMandatory())
    .addOption(
        new Option('-t, --token [string]', 'parallel-specs api token')
            .conflicts('email')
            .conflicts('password')
    )
    .addOption(
        new Option(
            '--email [string]',
            'parallel-specs account username'
        ).conflicts('token')
    )
    .addOption(
        new Option(
            '--password [string]',
            'parallel-specs account password'
        ).conflicts('token')
    )
    .addOption(
        new Option(
            '--include-specs <comma-separated-glob-patterns...>',
            'comma-separated glob patterns to include files'
        ).makeOptionMandatory()
    )
    .addOption(
        new Option(
            '--exclude-specs [comma-separated-glob-patterns...]',
            'comma-separated glob patterns to exclude files'
        ).default('')
    )
    .addOption(
        new Option(
            '--save-as-file',
            'save session data to parallel-specs-session.json'
        ).default(false)
    )
    .action((options) => {
        if (!options.email && !options.password && !options.token) {
            throw new InvalidOptionArgumentError(
                `required options '--token [string]' OR '--email [string] --password [string]' not specified`
            );
        }
        options.includeSpecs = options.includeSpecs || [];
        options.excludeSpecs = options.excludeSpecs || [];

        const client = new ParallelSpecsClient(options);

        const specs = readSpecFiles(options.includeSpecs, options.excludeSpecs)

        const session = client.addSession(specs);
        console.log(
            `session "${session.sessionId}" for project "${session.projectName}" is created`
        );

        options.saveAsFile
            ? fs.writeFileSync(
                  'parallel-specs-session.json',
                  JSON.stringify(
                      {
                          id: session.sessionId,
                          project: session.projectName
                      },
                      null,
                      2
                  )
              )
            : // you can grab this last output line on CI in case need to share session-id as env variable
              // PARALLEL_SPECS_SESSION_ID=$(parallel-specs-cli create-session (args for parallel spec client) | tail -1)
              console.log(session.sessionId);
    });

cli.parse(process.argv);
