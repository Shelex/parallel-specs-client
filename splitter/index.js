const split = require("./api");

class SplitTestClient {
  options = {
    url: "https://test-splitter.appspot.com/query",
    project: null,
    sessionId: null
  }

  constructor(options = {}) {
    console.log(`in constructor`);
    this.options = { ...this.options, ...options };
  }

  project(name = this.options.project) {
    return split.projectInfo(this.options, name);
  }

  nextSpec(machineId = 'default', sessionId = this.options.sessionId) {
    return split.nextSpec(this.options, sessionId, machineId);
  }

  addSession(specs, projectName = this.options.project) {
    console.log(`get addSession`);
    const res = split.createSession(this.options, projectName, specs);
    if (res && res.data && res.data && res.data.addSession) {
      this.options.sessionId = res.data.addSession.sessionId
    }
    return res
  }
}

module.exports = SplitTestClient
