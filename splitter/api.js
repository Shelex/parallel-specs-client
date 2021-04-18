const fetch = require("sync-fetch");

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

const projectInfo = (opts, name) =>
  fetch(opts.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(projectQuery(name)),
  }).json();

const createSession = (opts, projectName, specs) =>
  fetch(opts.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(addSessionQuery(projectName, specs)),
  }).json();

const nextSpec = (opts, sessionID, machineID) =>
  fetch(opts.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(nextSpecQuery(sessionID, machineID)),
  }).json();

module.exports = {
  projectInfo,
  createSession,
  nextSpec,
};
