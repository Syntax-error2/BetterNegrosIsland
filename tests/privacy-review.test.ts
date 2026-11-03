import test from "node:test";
import assert from "node:assert/strict";
import { sensitiveTextRules } from "../src/lib/privacy-review.ts";
test("privacy triage distinguishes public project coordinates and amounts from identifier contexts", () => {
  assert.deepEqual(
    sensitiveTextRules(
      "Construction in Binalbagan, 10.197508, 122.898621, PHP 1234567890",
    ),
    [],
  );
  assert.deepEqual(sensitiveTextRules("Contact: +63 912 345 6789"), [
    "contact-number",
  ]);
  assert.deepEqual(sensitiveTextRules("TIN No.: 123-456-789"), [
    "government-id-context",
  ]);
  assert.deepEqual(sensitiveTextRules("example@example.invalid"), [
    "email-address",
  ]);
});
