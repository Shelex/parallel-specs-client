const { SplitTestClient, filesToSpecInput } = require("../../index");

const client = new SplitTestClient({ project: "testing" });

// get all specs but ignore spec8
const specs = filesToSpecInput(["**/specs/*.js"], ["**/spec8.js"]);

function getRandomDuration(min, max) {
  const min = 1;
  const max = 7;
  return Math.floor(Math.random() * (max - min)) + min;
}

client.addSession(specs);

let iterator = 0;

function AskNextSpec() {
  setTimeout(function () {
    const next = client.nextSpec();
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

const projectResponse = client.project();
const { project } = projectResponse.data;
// output latest session (current one that just finished)
console.log(
  project.sessions.find((session) => session.id === project.latestSession)
);
