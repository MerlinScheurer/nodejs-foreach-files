import os from "os";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cliProgress from "cli-progress";
import getFileNameParts from "./helper/getFileNameParts.js";
import loadFiles from "./helper/loadFiles.js";
import { workerByFileType } from "./config/workerByFileType.js";

const cpuCount = os.cpus().length / 2;

const registeredFileTargetTypes = [];
let progress = null;
let workerQueued = 0;
let numDone = 0;
let targetDone = 0;

const knownSkipableFileExtensions = [
  "mp4",
  "mkv",
  "zip",
  "webm",
  "mov",
  "m4v",
  "avif",
  "txt",
  "3",
  "psd",
];

let verbose = false;

process.argv.forEach(function (val, index, array) {
  if (val === "--verbose" || val === "-v") {
    verbose = true;
  }
});

if (!verbose) {
  progress = new cliProgress.SingleBar({}, cliProgress.Presets.legacy);
}

Object.values(workerByFileType).map(({ worker, targetType }) => {
  if (registeredFileTargetTypes.includes(targetType)) {
    return;
  }

  registeredFileTargetTypes.push(targetType);

  worker.on("message", (result) => {
    workerQueued--;

    if (verbose) {
      console.log(`Worker result: ${JSON.stringify(result)}`);

      console.log(
        `Done: ${numDone}/${targetDone} Worker: ${workerQueued}/${cpuCount}`
      );
    }

    if (result.result) {
      const done = numDone++;
      if (!verbose) {
        progress.update(done);
      }
    }

    if (numDone === targetDone) {
      if (verbose) {
        console.log("Done!");
      }

      setTimeout(() => {
        worker.terminate();
        process.exit();
      }, 500);
    }
  });

  worker.on("error", (error) => {
    console.log(error);
  });

  worker.on("exit", (exitCode) => {
    console.log(exitCode);
  });
});

const areWorkerRunning = async (backoffIteration = 0) => {
  if (workerQueued >= cpuCount) {
    if (verbose) {
      console.log(`Waiting for worker(${workerQueued}/${cpuCount}) to reduce`);
    }
    backoffIteration++;

    await new Promise((r) => setTimeout(r, 100 * backoffIteration));

    return await areWorkerRunning(backoffIteration);
  }

  backoffIteration = 0;

  return Promise.resolve();
};

(async () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));

  const { files, count, inputFolder, outputFolder } = loadFiles(__dirname);
  targetDone = count;

  if (!verbose) {
    progress.start(count, 0);
  }

  for await (const file of files) {
    const { targetFolder, fileEnding, targetFileOrigFileEnding, targetFile } =
      getFileNameParts(file, inputFolder, outputFolder);

    fs.mkdirSync(targetFolder, { recursive: true });

    const hasUnknownFile = workerByFileType[fileEnding] === undefined;
    const hasKnownSkippableFile = knownSkipableFileExtensions.includes(
      fileEnding.toLowerCase()
    );

    // TODO: invert blacklist to whitelist
    if (hasUnknownFile || hasKnownSkippableFile) {
      if (hasUnknownFile && !hasKnownSkippableFile) {
        console.error(
          `\r\nUnknown FileExtension: ${fileEnding}\r\nFor File: ${file}\r\n`
        );
      }

      fs.copyFile(file, targetFileOrigFileEnding, (err) => {
        if (err && err.code === "ENOENT") {
          console.error(`\r\nBroken File: \r\n`);
        } else if (err) {
          throw err;
        }
      });

      if (verbose) {
        console.log(`copy ${file} to ${targetFileOrigFileEnding}`);
      }

      const done = numDone++;
      if (!verbose) {
        progress.update(done);
      }

      continue;
    }

    await areWorkerRunning();

    let targetFileWithEnding = `${targetFile}${workerByFileType[fileEnding].targetType}`;

    if (fs.existsSync(path)) {
      if (verbose) {
        console.log(`Exists: ${targetFileWithEnding}`);
      }

      const done = numDone++;
      if (!verbose) {
        progress.update(done);
      }

      continue;
    }

    workerQueued++;
    workerByFileType[fileEnding].worker.postMessage({
      source: file,
      target: targetFileWithEnding,
      verbose,
    });
  }
})();
