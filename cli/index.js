#!/usr/bin/env node
const { Option, Command, InvalidOptionArgumentError } = require('commander');
const SplitSpecClient = require('../splitter');
const readSpecFiles = require('../filereader');
const fs = require('fs');
const { readCyConfig } = require('./checkCyConfig');

const program = new Command();

// split-specs-cli create-session (args for split spec client)
program
    .command('create-session')
    .addOption(new Option('-p, --project <string>').makeOptionMandatory())
    .addOption(
        new Option('-t, --token [string]', 'split-specs api token')
            .conflicts('email')
            .conflicts('password')
    )
    .addOption(
        new Option(
            '--email [string]',
            'split-specs account username'
        ).conflicts('token')
    )
    .addOption(
        new Option(
            '--password [string]',
            'split-specs account password'
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
            'save session data to split-spec-session.json'
        ).default(false)
    )
    .action((options) => {
        console.log(options);
        if (!options.password && !options.token && !options.email) {
            throw new InvalidOptionArgumentError(
                `required options '--token [string]' OR '--email [string] --password [string]' not specified`
            );
        }
        options.includeSpecs = options.includeSpecs || [];
        options.excludeSpecs = options.excludeSpecs || [];

        const client = new SplitSpecClient(options);

        const cfg = readCyConfig();
        const specs = readSpecFiles(
            [...options.includeSpecs, ...cfg.include],
            [...options.excludeSpecs, ...cfg.ignore]
        );

        const session = client.addSession(specs);
        console.log(
            `session "${session.sessionId}" for project "${session.projectName}" is created`
        );

        options.saveAsFile
            ? fs.writeFileSync(
                  'split-spec-session.json',
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
              // SPLIT_SPEC_SESSION_ID=$(split-spec-cli create-session (args for split spec client) | tail -1)
              console.log(session.sessionId);
    });

program.parse(process.argv);
