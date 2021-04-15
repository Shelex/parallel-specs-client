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

const nextSpecQuery = (sessionID) => ({
  query: `
          query nextSpec($sessionId: String!) {
              nextSpec(sessionId: $sessionId)
              }
            `,
  variables: {
    sessionId: sessionID,
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

const nextSpec = (opts, sessionID) =>
  fetch(opts.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(nextSpecQuery(sessionID)),
  }).json();

module.exports = {
  projectInfo,
  createSession,
  nextSpec,
};
