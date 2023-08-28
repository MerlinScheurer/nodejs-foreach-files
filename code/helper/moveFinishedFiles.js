import fs from "node:fs";
import path from "node:path";
import cliProgress from "cli-progress";

const moveFinishedFiles = (inputFolder, outputFolder, files) => {
  // Copy files to output
  const filesAfterConvert = fs.readdirSync(inputFolder);

  let numDone = 0;

  const filesDiff = filesAfterConvert.filter((file) => {
    return !files.includes(file);
  });

  const copyProgress = new cliProgress.SingleBar(
    {},
    cliProgress.Presets.legacy
  );
  console.log("Copy files to output.");
  copyProgress.start(filesDiff.length, 0);

  filesDiff.forEach((file) => {
    const target = path.join(inputFolder, file);
    const destination = path.join(outputFolder, file);

    fs.rename(target, destination, (err) => {
      if (err) throw err;

      numDone++;
      copyProgress.update(numDone);
    });
  });

  copyProgress.stop();
};

export default moveFinishedFiles;
