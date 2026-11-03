import test from "node:test";
import assert from "node:assert/strict";
import { checkoutIssueId } from "./proxy.mjs";

test("public proxy identifies direct issue checkout mutations for gate enforcement", () => {
  assert.equal(checkoutIssueId("POST", "/api/issues/issue-123/checkout"), "issue-123");
  assert.equal(checkoutIssueId("POST", "/api/issues/issue%2Fencoded/checkout?force=true"), "issue/encoded");
  assert.equal(checkoutIssueId("GET", "/api/issues/issue-123/checkout"), null);
  assert.equal(checkoutIssueId("POST", "/api/issues/issue-123/comments"), null);
});
