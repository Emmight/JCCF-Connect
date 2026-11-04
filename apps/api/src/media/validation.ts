import { fileTypeFromBuffer } from "file-type";

const extensionsByMime = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

export async function inspectImage(buffer: Buffer) {
  const detected = await fileTypeFromBuffer(buffer);
  const extension = detected ? extensionsByMime.get(detected.mime) : undefined;
  return detected && extension ? { mime: detected.mime, extension } : null;
}

export function isSafeMediaStorageKey(value: string) {
  return /^[0-9a-f-]{36}\.(jpg|png|webp)$/.test(value);
}