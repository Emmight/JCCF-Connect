import assert from "node:assert/strict";
import test from "node:test";

import { inspectImage, isSafeMediaStorageKey } from "./validation.js";

test("recognizes image content from its signature", async () => {
  const onePixelPng = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jzL8AAAAASUVORK5CYII=",
    "base64"
  );

  assert.deepEqual(await inspectImage(onePixelPng), { mime: "image/png", extension: "png" });
});

test("rejects content that is not an allowed image format", async () => {
  assert.equal(await inspectImage(Buffer.from("<svg><script>alert(1)</script></svg>")), null);
  assert.equal(await inspectImage(Buffer.from("not an image")), null);
});

test("accepts only generated opaque media keys", () => {
  assert.equal(isSafeMediaStorageKey("123e4567-e89b-12d3-a456-426614174000.webp"), true);
  assert.equal(isSafeMediaStorageKey("../../secret.png"), false);
  assert.equal(isSafeMediaStorageKey("user-file.jpg"), false);
});