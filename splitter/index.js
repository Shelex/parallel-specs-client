const split = require('./api');

class SpecSplitClient {
    options = {
        url: 'https://split-specs.appspot.com/query',
        project: null,
        sessionId: null,
        token: null,
        email: null,
        password: null
    };

    constructor(options = {}) {
        this.options = { ...this.options, ...options };
        if (!this.options.token) {
            const res = split.login(this.options);
            handleError(res);
            this.options.token = res.data.login;
        }
    }

    project(name = this.options.project) {
        const res = split.projectInfo(this.options, name);
        handleError(res);
        return res.data.project;
    }

    nextSpec(nextOptions = {}) {
        nextOptions = Object.assign(
            {
                machineId: 'default',
                sessionId: this.options.sessionId,
                isPassed: false
            },
            nextOptions
        );
        const res = split.nextSpec(this.options, nextOptions);
        if (res.errors) {
            if (res.errors[0].message.includes('finished')) {
                return null;
            }
            handleError(res);
        }
        return res.data.nextSpec;
    }

    addSession(specs, projectName = this.options.project) {
        const res = split.createSession(this.options, projectName, specs);
        handleError(res);
        if (res && res.data && res.data && res.data.addSession) {
            this.options.sessionId = res.data.addSession.sessionId;
        }
        return res.data.addSession;
    }
}

const gqlError = (errors) => {
    const [err] = errors;
    let message = `${err.message}`;
    if (err.path) {
        message += ` ${err.path.join('.')}`;
    }
    if (err.extensions) {
        message += ` code: ${err.extensions.code}`;
    }
    return message;
};

const handleError = (res) => {
    if (res.errors) {
        throw new Error(gqlError(res.errors));
    }
};

module.exports = SpecSplitClient;
