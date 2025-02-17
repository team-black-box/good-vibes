# good-vibes

[![codecov](https://codecov.io/gh/subramanian-elavathur/good-vibes/branch/main/graph/badge.svg?token=1D68W4DNN1)](https://codecov.io/gh/subramanian-elavathur/good-vibes) ![npm-version](https://img.shields.io/npm/v/good-vibes?color=blue)

Good Vibes is a simple Node.js testing library designed to make writing and executing tests easy and fun.

It was inspired by, and written primarily while listening to, [Alicia Keys' Tiny Desk Concert](https://www.youtube.com/watch?v=uwUt1fVLb3E)

## Installation

```bash
npm install good-vibes --save-dev
```

## Getting started

Lets say you wanted to test the following function defined in `code.js`

```javascript
// defined in ./src/code.js
const codeToTest = (firstName, lastName, age) => {
    return {
        name: {
            first: firstName,
            last: lastName,
        },
        age: age
    }
}
export codeToTest;
// use the following if you use commonjs style exports
// exports.codeToTest = codeToTest
```

Here is how you would write a test using good-vibes for this function

```javascript
// defined in ./test/code.test.js
import { codeToTest } from "./src/code";
import run, { test } from "good-vibes";
// alternatively `const { test, run } = require('good-vibes');

test("My first test", (context) => {
  const expected = {
    name: { first: "Hello", last: "World" },
    age: 999,
  };
  context.log("Lets do this!");
  context.check(expected, codeToTest("Hello", "World", 999));
  context.done();
});

run(); // runs all your tests defined using the `test` api
```

To run this test add a script to your `package.json` file

```json
{
  "name": "my-library",
  "version": "0.0.1",
  "scripts": {
    "test": "node test/code.test.js"
  }
}
```

And then on command line type

```bash
npm test
```

## Lets now explain what the above code does

### `test`

The `test` function allows you to define a test. It has the following signature:

```javascript
test("name", testFunction, "groupName");
```

#### `name`

Name of your test

#### `testFunction`

Expects a function with the following signature:

```javascript
const testFunction = (context) => {
  // run your code
  // make assertions using context.check(expected, actual)
  // mark test as complete using context.done()
};
```

##### `context`

A simple utility and assertion framework wrapped within the context of your test and group that provides the following api's:

1. `check(expected, actual)`: uses [lodash.isEqual](https://lodash.com/docs/#isEqual) to perform deep equality checks on primitives and objects and more
2. `done()`: marks test as complete
3. `log(message)`: log provides a simple wrapper over `console.log` with the test name prefixed to your message to make them easier to find in the logs
4. `snapshot(name, actual, updateBaseline)`: allows for snapshot testing, discussed later in this guide

#### `groupName`

Allows you to create a group of tests. More on this below. If not specified the test is assiged to the `Default` group.

### `run`

Calling the `run()` api starts the test execution. It accepts a configuration object as follows:

```javascript
run({
  timeout: 300_000, // in milliseconds
  snapshotsDirectory: "./test/__snapshots/", // string
  executionTimePrecision: 4, // number
});
```

#### timeout

This is the total amount of time all tests have to run before good-vibes end execution.

Default is set to `5 minutes`. After 5 minutes good-vibes will end all test execution and return with error code `1`

#### snapshotsDirectory

Default value is set to `./test/__snapshots__/`. For more details see section on `Snapshot Testing` below.

#### executionTimePrecision

This option specifies the precision to which execution time of the tests are calculated . It is an optional value which is set to a default value of `3`.

#### Running tests from multiple files

TODO

## Asynchronous Testing

All tests defined using `test` are considered to be asynchronous function. This is the reason you need to tell good-vibes that your test is complete by calling the `context.done()` api.

Here is an example of an asynchronous test

```javascript
// defined in ./async.test.js
import run, { test } from "good-vibes";

const sayGreeting = async (message) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(`Hello, ${message}`), 2000); // resolve value after 2 seconds
  });
};

test("Async Test", async (context) => {
  // note the async declaration
  const actual = await sayGreeting("World!"); // waiting for result
  context.check("Hello, World!", actual);
  context.done(); // mark test as complete
});

run(); // runs all your tests defined using the `test` api
```

## Grouping tests

The `test` api supports `groupName` as the third argument which allows you to groups similar tests together. Groups have the following features:

1. Groups always run sequentially one after the other
   1. All tests inside the group must finish before next group starts
   2. Tests inside a group run concurrently (unless `sync` is called)
2. Groups can have setup and teardown code defined using `before` and `after` api

### Example

```javascript
import run, { before, test, after } from "good-vibes";

const MY_GROUP = "My Group";

let numbers;
let strings;

before((context) => {
  // context inside before and after blocks only have done() and log(message) api's
  numbers = [1, 2, 3, 4, 5];
  context.log("Logging is supported inside before and after blocks as well");
  setTimeout(() => {
    strings = ["this", "value", "is", "set", "after", "2", "seconds"];
    context.done(); // dont forget to call done
  }, 2000);
}, MY_GROUP);

test(
  "My Test",
  (ctx) => {
    ctx
      .check(5, numbers.length)
      .check("1,2,3,4,5", numbers.join(","))
      .check(7, strings.length)
      .check("this value is set after 2 seconds", strings.join(" "))
      .done();
  },
  MY_GROUP
);

after((ctx) => {
  numbers = undefined;
  strings = undefined;
  ctx.done();
}, MY_GROUP); // group name is important so dont forget it :)

run();
```

### `before`

`before` function runs once before all tests and has the following signature

```javascript
before(beforeFunction, groupName); // groupName defaults to 'Default' group
```

#### beforeFunction

`beforeFunction` has the following signature

```javascript
const beforeFunction = async (context) => {
  // perform your test setup here
  // call context.done() once complete
};
```

### `after`

`after` function runs once after all tests have finished and has the same signature as `before`

### Concise Groups

It can sometimes be verbose to have to specify the group name in each of `before`, `after` and `test` api calls. To make this easier good-vibes provides the `group` api which wraps all api's with the specified group name.

Lets rewrite the above example now using the `group` api.

```javascript
import run, { group } from "good-vibes";

const MY_GROUP = "My Group";

const { before, test, after } = group(MY_GROUP); // wrap good-vibes api's with MY_GROUP groupName

let numbers;
let strings;

before((ctx) => {
  numbers = [1, 2, 3, 4, 5];
  setTimeout(() => {
    strings = ["this", "value", "is", "set", "after", "2", "seconds"];
    ctx.done();
  }, 2000);
});

test("My Test", (ctx) => {
  ctx
    .check(5, numbers.length)
    .check("1,2,3,4,5", numbers.join(","))
    .check(7, strings.length)
    .check("this value is set after 2 seconds", strings.join(" "))
    .done();
});

after((ctx) => {
  numbers = undefined;
  strings = undefined;
  ctx.done();
});

run();
```

## Snapshot Testing

Sometimes the output of a function can be very large - making it cumbersome to test using the `context.check` api. To help with this good-vibes supports snapshot testing.

Snapshot tests allow you test for changes in the expected output. They do this by maintaining a `baseline` file with the expected output. Then whenever you run your test the actual output is compared against this baseline file and if they don't match the differences are reported as shown below:

![Snapshot assertion failure](/docs/images/snapshot-testing.png "Snapshot assertion failure")

### Simple Example

```javascript
import { group } from "good-vibes";

const { test } = group("Snapshots");

let createLargeObject = (value) => ({
  a: value,
  b: 123,
  c: true,
  d: [1, 2, 3, 4, 5],
  e: {
    f: [
      {
        a: value,
        b: 123,
        c: true,
        d: [1, 2, 3, 4, 5],
      },
    ],
  },
});

test("Large Object", (ctx) => {
  // snapshot verifications are asynchronous so you must await its execution
  await ctx.snapshot("Check 1", createLargeObject("One"));
  // A single test may have one or more snapshot assertions, each snapshot inside a test must have a unique name
  await ctx.snapshot("Check 2", createLargeObject("Two"));
  // dont forget to call done() at the end
  ctx.done();
});

run();
```

In the above example `good-vibes` will check if the output of `createLargeObject` matches the snapshot with name `Check 1` and `Check 2` respectively.

Notes:

1. Snapshots internally use JSON.stringify to write the snapshot files, so please be careful while creating snapshots of objects with functions in them
2. Order of keys in the object does not matter as the verification is performed on the parsed JSON object and not the json string itself

### Snapshot API

The `snapshot` function allows you to define a test. It has the following signature:

```typescript
async snapshot<Type>(snapshotName: string, actualValue: Type, rebase?: boolean): Promise<TestContext>
```

### Creating or updating a baseline

The first time you run the snapshot test it will fail stating that the baseline file could not be found, similar to the image below:

![Snapshot missing failure](/docs/images/missing-baseline.png "Snapshot missing failure")

To create a new baseline or update an existing one, set the third argument of the `snapshot` api to `true`

**Important Note:** When you rebase a snapshot file, good-vibes will automatically **fail** that test. This is to safeguard against accidental updates to snapshot files and prevent this flag from being committed into source control

### Snapshots directory and file structure

#### Directory Structure

By default good-vibes will create a directory to store all snapshots at this location: `./test/__snapshots__`. Inside this folder a new folder is created for each `group` of tests.

You may override this property by setting the `snapshotsDirectory` configuration property while calling the `run` function. See section on `run` api above for more details.

#### Snapshot file naming convention

All snapshot files are named using the following convention: `<test-name>_<snapshot-name>.json`

#### Overall Structure

Putting the above conventions together, the following template specifies the exact location (using defaults): `./test/__snapshots__/<group-name>/<test-name>_<snapshot-name>.json`

In case of our example tests above, following would be the snapshot paths:

`./test/__snapshots__/Snapshots/Large Object_Check 1.json`

`./test/__snapshots__/Snapshots/Large Object_Check 2.json`

#### Example

![Snapshot directory structure](/docs/images/snapshot-directory-structure.png "Snapshot directory structure")

## Synchronous Testing

By default all tests inside a group are considered `async` and run concurrently. However you may change this behavior at the group level by use of the `sync` api. The order of the tests in synchronous testing mode is the order of declaration in the test file from top to bottom.

### `sync` api signature

```typescript
sync(groupName?: string) // groupName defaults to "Default"
```

### Using `sync` api

```javascript
import run, { before, test, sync } from "good-vibes";

const MY_GROUP = "My Group";

let numbers;
let strings;

before((context) => {
  numbers = [1, 2, 3, 4, 5];
  strings = ["sample", "values"];
}, MY_GROUP);

test(
  "My Test",
  (ctx) => {
    ctx.check(5, numbers.length).check("1,2,3,4,5", numbers.join(",")).done();
  },
  MY_GROUP
);

// You can invoke the sync api anywhere in any of your test files
// Because tests only run when the `run()` api is called
// good-vibes will ensure all tests in this group run synchonously

sync(MY_GROUP);

test(
  "My Test",
  (ctx) => {
    ctx
      .check(7, strings.length)
      .check("sample values", strings.join(" "))
      .done();
  },
  MY_GROUP
);

run();
```

### Using the concise groups `sync` api

```javascript
import run, { group } from "good-vibes"; // import sync from good-vibes

const MY_GROUP = "My Group";

const { before, test, sync } = group(MY_GROUP);

sync();

let numbers;
let strings;

before((context) => {
  numbers = [1, 2, 3, 4, 5];
  strings = ["sample", "values"];
});

test("My Test", (ctx) => {
  ctx.check(5, numbers.length).check("1,2,3,4,5", numbers.join(",")).done();
});

test("My Test", (ctx) => {
  ctx.check(7, strings.length).check("sample values", strings.join(" ")).done();
});

run();
```

## Debugging

When you have too many tests in your application, its often useful to be able to run just one or a few failing tests alone to debug the cause of their failure.

good-vibes support this using a special purpose group name called `Debug`. `Debug` group name can be used in `before`, `test` and `after` api's and even inside concise groups.

**Recommendation**: We recommend that you `import { DEBUG } from 'good-vibes'` instead of redefining the variable yourself. This will isolate your tests from changes to this group name in the future.

**Important Note**: When running in debug mode good-vibes exits with failure return code 1 - this is to prevent the debug flag from being accidentally committed to source control. The following disclaimer will also be printed in the logs:

![Debug mode disclaimer](/docs/images/debug-mode.png "Debug mode disclainer")

### Using the `Debug` group

```javascript
const run, { before, test, DEBUG } = require("../lib/index");

// When running in debug mode only tests tagged with DEBUG group are run,
// all other tests are skipped
// Good vibes also exits with a return code of 1 to prevent tests from being
// checked into your codebase accidentally

before((ctx) => {
  ctx.log("You can run before and after blocks even in debug mode");
  ctx.done();
}, DEBUG);

test(
  "Johnny Cash",
  (ctx) => {
    setTimeout(() => {
      ctx.log("Hurt");
      ctx.check(1, 1).done();
    }, 2000);
  },
  DEBUG
);

run();
```

### Concise groups with `Debug`

```javascript
import run, { group, DEBUG } from "good-vibes";

const MY_GROUP = "My Group";

const { before, test, sync } = group(MY_GROUP);

let numbers;
let strings;

before((context) => {
  numbers = [1, 2, 3, 4, 5];
  strings = ["sample", "values"];
}, DEBUG);

// always ensure that you run your before blocks in DEBUG mode too
// if you before some setup for the test being debugged

test(
  "My Test",
  (ctx) => {
    ctx.check(5, numbers.length).check("1,2,3,4,5", numbers.join(",")).done();
  },
  DEBUG
); // running only one test in DEBUG mode

test("My Test", (ctx) => {
  ctx.check(7, strings.length).check("sample values", strings.join(" ")).done();
});

run();
```

### Debugging nodejs programs in your IDE

[Instructions for VS Code](https://code.visualstudio.com/docs/nodejs/nodejs-debugging)

## Code Coverage

Code coverage reports can be generated using the `nyc` package. For up-to-date instruction please check out [Installation & Usage section of nyc](https://github.com/istanbuljs/nyc#installation--usage)

### Using `nyc` with `good-vibes`

First install `nyc` as a dev dependency

```bash
npm install nyc --save-dev
```

Next update your `package.json` scripts section to add a coverage script to run `nyc`

```json
{
  "name": "my-library",
  "version": "0.0.1",
  "scripts": {
    "test": "node test/code.test.js",
    "coverage": "nyc --reporter=lcov --reporter=text-summary npm run test"
  }
}
```

The above configuration generates a text-summary and a detailed lcov report with html visualization

### Text Summary Report

![Coverage Text Summary](/docs/images/text-summary.png "Coverage Text Summary")

### lcov Coverage Report

This can be found inside the `/coverage` folder, a sample report is shown below:

![Coverage lcov HTML](/docs/images/lcov-html.png "Coverage lcov HTML")

## Examples

- Simple tests can be found in [test/simple.test.js](./test/simple.test.js)
- Test grouping with use of `before` and `after` can be found in [test/groups.test.js](./test/groups.test.js)
- Example of `snapshot` tests can be found in [test/snapshot.test.js](./test/snapshot.test.js)
- A concise example of groups using the `group` api can be found in [test/concise-groups.test.js](./test/concise-groups.test.js)
- Examples of `sync` tests can be found in [test/synchronous.test.js](./test/synchronous.test.js)
- Examples of failing tests can be found in [test/failing.test.js](./test/failing.test.js)
- Example of how `debug` mode works can be found in [test/debug.test.js](./test/debug.test.js)
