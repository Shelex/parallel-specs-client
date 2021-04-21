const fetch = require("sync-fetch");

const loginQuery = (username, password) => ({
  query: `
            mutation login($user: User!) {
              login(input: $user)
            }
            `,
  variables: {
    user: {
      username: username,
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

const nextSpecQuery = (sessionID, machineID) => ({
  query: `
          query nextSpec($sessionId: String!, $machineId: String) {
              nextSpec(sessionId: $sessionId, machineId: $machineId)
              }
            `,
  variables: {
    sessionId: sessionID,
    machineId: machineID,
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

const login = (opts) =>
  jqlRequest(opts, loginQuery(opts.username, opts.password));
const projectInfo = (opts, name) => jqlRequest(opts, projectQuery(name));
const createSession = (opts, projectName, specs) =>
  jqlRequest(opts, addSessionQuery(projectName, specs));
const nextSpec = (opts, sessionID, machineID) =>
  jqlRequest(opts, nextSpecQuery(sessionID, machineID));

module.exports = {
  login,
  projectInfo,
  createSession,
  nextSpec,
};
