import "./simple.test";
import "./groups.test";
import "./concise-groups.test";
import "./snapshot.test";
import "./synchronous.test";
import "./failing.test"; // uncomment to see failing test behavior
// require("./debug.test"); // uncomment to see debug test behavior
import run from "../src/index";
import "./precisionControl.test";

run({
  returnCodeOnFailure: 0,
  reportTestResults: true,
  executionTimePrecision: 5,
});

// Possible options to run command include
// {
//   timeout: 1000, // in milliseconds
//   snapshotsDirectory: "path", // string
// }
