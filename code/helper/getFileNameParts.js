import path from "node:path";

function getFileNameParts(file, inputFolder, outputFolder) {
  const fileAtInput = file.replace(inputFolder, "");
  const fileSplitted = fileAtInput.split(".");
  const fileEnding = fileSplitted.pop().toLowerCase();
  const fileJoined = fileSplitted.join(".");

  const targetFileOrigFileEnding = path.join(
    outputFolder,
    `${fileJoined}.${fileEnding}`
  );
  const targetFile = path.join(outputFolder, `${fileJoined}.`);
  const targetFolder = path.dirname(targetFile);

  return { targetFolder, fileEnding, targetFileOrigFileEnding, targetFile };
}

export default getFileNameParts;
