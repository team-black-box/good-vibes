import { test } from "../src";
import calculateExecutionTime from "../src/index";

test("Precision Control Test-1", async (context) => {
  const expected = 0.03;
  const recieved = await calculateExecutionTime(4, 7, 3);
  context.check(expected, recieved);
  context.done();
});
