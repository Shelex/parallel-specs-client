const { SplitTestClient, filesToSpecInput } = require("../index");

const client = new SplitTestClient({ project: "testing" });

// get all specs but ignore spec8
const specs = filesToSpecInput(["**/specs/*.js"], ["**/spec8.js"]);

function getRandomDuration() {
  const min = 1;
  const max = 7;
  return Math.floor(Math.random() * (max - min)) + min;
}

console.log(client.options)
// get project info
const projectResponse = client.project();
const { project } = projectResponse.data;
// output latest session (previous one)
console.log(
  project.sessions.find((session) => session.id === project.latestSession)
);

client.addSession(specs);

let iterator = 0;

function AskNextSpec() {
  setTimeout(function () {
    const next = client.nextSpec(getRandomDuration() >= 4 ? 'runner1' : 'runner2');
    if (!next.errors) {
      console.log(
        `${Date.now().toLocaleString()} running spec ${next.data.nextSpec}`
      );
    }
    iterator++;
    // we should ask one more time after last spec to let service know that it is finished
    if (iterator <= specs.length) {
        AskNextSpec();
    }
  }, getRandomDuration() * 1000);
}

AskNextSpec();

// ensure specs for runner1 and runner2 stopped:
client.nextSpec('runner1')
client.nextSpec('runner2')