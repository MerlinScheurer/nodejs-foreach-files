import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const inputFolder = path.join(__dirname, "..", "..", "input");
const outputFolder = path.join(__dirname, "..", "..", "output");

if (!fs.existsSync(inputFolder)) {
  fs.mkdirSync(inputFolder, { recursive: true });
}

if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder, { recursive: true });
}
