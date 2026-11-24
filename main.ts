// SPDX-License-Identifier: MIT
// One Line, One Chill — main.ts (Node 22)
// Writes one original horror line, a single sentence under 200 characters,
// to /output/entry.txt (or $MAKEFUN_OUTPUT_DIR/entry.txt), deterministically.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const LINE =
  "The nursery camera showed my daughter asleep, and in the corner of the crib a small hand waved at the lens, though both of hers were tucked under the blanket.";

function gate(line: string): void {
  const chars = [...line].length;
  if (chars < 1 || chars > 200) {
    throw new Error(`entry must be 1-200 characters, got ${chars}`);
  }
  if (line !== line.trim()) {
    throw new Error("entry must not have leading or trailing whitespace");
  }
  for (const ch of line) {
    const code = ch.codePointAt(0) as number;
    if (code < 0x20 || code === 0x7f) {
      throw new Error("entry must not contain control characters");
    }
  }
  if (line.includes("\n") || line.includes("\r")) {
    throw new Error("entry must be a single line");
  }
  // One sentence, one breath: exactly one sentence terminator, and it must
  // be the final character, so the line cannot smuggle in a second sentence.
  const terminators = (line.match(/[.!?]/g) ?? []).length;
  if (terminators !== 1 || !/[.!?]$/.test(line)) {
    throw new Error("entry must be exactly one sentence");
  }
  if (line.trim().length === 0) {
    throw new Error("entry must not be only whitespace");
  }
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
gate(LINE);
const outPath = join(outDir, "entry.txt");
writeFileSync(outPath, LINE, "utf8");

// Read back with strict UTF-8 decoding and verify byte-for-byte: what we
// wrote is what the judge gets.
const back = new TextDecoder("utf-8", { fatal: true }).decode(
  readFileSync(outPath),
);
if (back !== LINE) {
  throw new Error("read-back mismatch: entry.txt does not match the line");
}
console.log(`wrote ${[...LINE].length} chars to ${outPath}`);
