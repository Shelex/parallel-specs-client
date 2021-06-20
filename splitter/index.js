const split = require("./api");

class SpecSplitClient {
  options = {
    url: "http://split-specs.appspot.com/query",
    project: null,
    sessionId: null,
    token: null,
    email: null,
    password: null,
  };

  constructor(options = {}) {
    this.options = { ...this.options, ...options };
    if (!this.options.token) {
      const res = split.login(this.options);
      if (res.errors) {
        throw new Error(res.errors[0].message);
      }
      this.options.token = res.data.login;
    }
  }

  project(name = this.options.project) {
    const res = split.projectInfo(this.options, name);
    if (res.errors) {
      throw new Error(res.errors[0].message);
    }
    return res.data.project;
  }

  nextSpec(machineId = "default", sessionId = this.options.sessionId) {
    const res = split.nextSpec(this.options, sessionId, machineId);
    if (res.errors) {
      if (res.errors[0].message === "session finished") {
        return null;
      }
      throw new Error(res.errors[0].message);
    }
    return res.data.nextSpec;
  }

  addSession(specs, projectName = this.options.project) {
    const res = split.createSession(this.options, projectName, specs);
    if (res.errors) {
      throw new Error(res.errors[0].message);
    }
    if (res && res.data && res.data && res.data.addSession) {
      this.options.sessionId = res.data.addSession.sessionId;
    }
    return res.data.addSession;
  }
}

module.exports = SpecSplitClient;
