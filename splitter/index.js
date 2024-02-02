const parallelSpecs = require('./api');

class ParallelSpecsClient {
    options = {
        baseUrl: 'https://parallel-specs.shelex.dev/api',
        get url() {
            return path => `${this.baseUrl}/${path}`
        },
        projectName: null,
        projectId: null,
        sessionId: null,
        token: null,
        email: null,
        password: null
    };

    constructor(options = {}) {
        this.options = { ...this.options, ...options };
        if (!this.options.token) {
            const res = parallelSpecs.login(this.options);
            console.log(res)
            handleError(res);
            this.options.token = res.token;
        }
    }

    project(id) {
        if (id) {
            this.options.projectId = id
        }
        if (!this.options.projectId) {
            throw new Error(`project id not available, cannot identify project`)
        }
        const res = parallelSpecs.projectInfo(this.options);
        handleError(res);
        return res;
    }

    next(nextOptions = {}) {
        nextOptions = Object.assign(
            {
                machineId: 'default',
                previousStatus: 'unknown'
            },
            nextOptions
        );
        const res = parallelSpecs.next(this.options, this.options.sessionId, nextOptions);
        if (res.errors) {
            if (res.errors.some(message => message.includes('finished'))) {
                return null;
            }
            handleError(res);
        }
        return res.next;
    }

    addSession(specs, projectName = this.options.project) {
        const res = parallelSpecs.createSession(this.options, projectName, specs);
        handleError(res);
        if (res) {
            this.options.sessionId = res.sessionId;
            this.options.projectId = res.projectId;
            this.options.projectName = res.projectName;
        }
        return res;
    }
}

const getMessage = (errors) => {
    const [message] = errors;
    return message;
};

const handleError = (res) => {
    if (res.errors) {
        throw new Error(getMessage(res.errors));
    }
};

module.exports = ParallelSpecsClient;
