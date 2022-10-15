import { test } from "../src";
import { calculateExecutionTime } from "../src/index";

test("Precision Control Test-1", (context) => {
  const expected = 0.003;
  const recieved = calculateExecutionTime(4, 7, 3);
  context.check(expected, recieved);
  context.done();
});
