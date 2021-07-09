const fetch = require("sync-fetch");

const loginQuery = (email, password) => ({
  query: `
            mutation login($user: User!) {
              login(input: $user)
            }
            `,
  variables: {
    user: {
      email: email,
      password: password,
    },
  },
  operationName: "login",
});

const projectQuery = (name) => ({
  query: `
          query project($name: String!) {
                  project(name: $name) {
                      projectName
                      latestSession
                      sessions{
                        id
                        start
                        end
                        backlog {
                          file
                          passed
                          estimatedDuration
                          start
                          end
                          assignedTo
                        }
                      }
                    }
              }
            `,
  variables: {
    name: name,
  },
  operationName: "project",
});

const addSessionQuery = (projectName, specs) => ({
  query: `
          mutation addSession($session: SessionInput!) {
              addSession(session: $session) {
                  sessionId
                  projectName
                    }
              }
            `,
  variables: {
    session: {
      projectName: projectName,
      specFiles: specs,
    },
  },
  operationName: "addSession",
});

const nextSpecQuery = (opts) => ({
  query: `
          query nextSpec($sessionId: String!, $options: NextOptions) {
              nextSpec(sessionId: $sessionId, options: $options)
              }
            `,
  variables: {
    sessionId: opts.sessionId,
    options: {
      machineId: opts.machineId,
      previousPassed: opts.isPassed,
    },
  },
  operationName: "nextSpec",
});

const defaultHeader = {
  "Content-Type": "application/json",
};

const header = (opts) =>
  opts.token
    ? { ...defaultHeader, ...{ Authorization: opts.token } }
    : defaultHeader;

const jqlRequest = (opts, query) =>
  fetch(opts.url, {
    method: "POST",
    headers: header(opts),
    body: JSON.stringify(query),
  }).json();

const login = (opts) => jqlRequest(opts, loginQuery(opts.email, opts.password));
const projectInfo = (opts, name) => jqlRequest(opts, projectQuery(name));
const createSession = (opts, projectName, specs) =>
  jqlRequest(opts, addSessionQuery(projectName, specs));
const nextSpec = (opts, nextOptions) =>
  jqlRequest(opts, nextSpecQuery(nextOptions));

module.exports = {
  login,
  projectInfo,
  createSession,
  nextSpec,
};
