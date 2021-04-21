const { SplitTestClient, filesToSpecInput } = require("../index");

// pass credentials and project
const client = new SplitTestClient({ project: "test", username: "admin", password: "admin" });

// get all specs but ignore spec8
const specs = filesToSpecInput(["**/specs/*.js"], ["**/spec8.js"]);

function getRandomDuration() {
  const min = 1;
  const max = 7;
  return Math.floor(Math.random() * (max - min)) + min;
}

// create new session
client.addSession(specs);

let iterator = 0;

function AskNextSpec() {
  setTimeout(function () {
    const next = client.nextSpec(getRandomDuration() >= 4 ? 'runner1' : 'runner2');
    if (next) {
      console.log(
        `${Date.now()} running spec ${next}`
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