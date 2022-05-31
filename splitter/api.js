const fetch = require('sync-fetch');

const defaultHeader = {
    'Content-Type': 'application/json'
};

const header = (opts) =>
    opts.token
        ? { ...defaultHeader, ...{ Authorization: `Bearer ${opts.token}` } }
        : defaultHeader;

const request = (path, method, opts, body) => {
    const req = {
        method: method,
        headers: header(opts)
    };

    if (body) {
        req.body = JSON.stringify(body);
    }

    const res = fetch(opts.url(path), req);
    const resText = res.text();

    try {
        return JSON.parse(resText);
    } catch (_) {
        return {
            errors: [resText]
        };
    }
};

const login = (opts) =>
    request('auth', 'POST', opts, {
        email: opts.email,
        password: opts.password
    });

const createSession = (opts, projectName, specs) =>
    request('session', 'POST', opts, {
        projectName: projectName,
        specFiles: specs
    });

const nextSpec = (opts, sessionId, nextOptions) =>
    request(
        `session/${sessionId}/next?${new URLSearchParams(nextOptions)}`,
        'GET',
        opts
    );

const projectInfo = (opts) =>
    request(
        `projects/${opts.projectId}/sessions?limit=15&offset=0`,
        'GET',
        opts
    );

module.exports = {
    login,
    projectInfo,
    createSession,
    nextSpec
};
