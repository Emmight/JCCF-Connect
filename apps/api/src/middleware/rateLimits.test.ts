import assert from "node:assert/strict";
import test from "node:test";
import express from "express";

import { mediaRequestRateLimit } from "./rateLimits.js";

test("rate-limits public media request submissions", async (context) => {
  const app = express();
  app.post("/requests", mediaRequestRateLimit, (_req, res) => res.sendStatus(201));
  const server = app.listen(0, "127.0.0.1");
  context.after(() => new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));

  await new Promise<void>((resolve) => server.once("listening", resolve));
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const url = `http://127.0.0.1:${address.port}/requests`;
  const statuses: number[] = [];

  for (let attempt = 0; attempt < 6; attempt += 1) {
    statuses.push((await fetch(url, { method: "POST" })).status);
  }

  assert.deepEqual(statuses.slice(0, 5), [201, 201, 201, 201, 201]);
  assert.equal(statuses[5], 429);
});