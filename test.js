const { SplitTestClient, filesToSpecInput } = require("./index");

const client = new SplitTestClient();

const project = "thisistest";
const specs = ["1", "2", "3"].map((s) => ({ filePath: s }));
const session = client.addSession(project, specs);
console.log(session);
const { sessionId } = session.data.addSession;

const files = filesToSpecInput(['**/splitter/**'], ['**api**'])
console.log(files)

console.log(client.nextSpec(sessionId));
console.log(client.nextSpec(sessionId));
console.log(client.nextSpec(sessionId));
const expectedError = client.nextSpec(sessionId);
console.log(expectedError);

const projectInfo = client.project(project);
console.log(projectInfo);
