import { test } from "uvu";
import * as assert from "uvu/assert";
import patch from "../dist/index.js";

test("error when patching at inexistent path", () => {
	assert.throws(() => patch(["one", "two"], [{ path: [3], type: "REMOVE" }]));
});

test.run();
