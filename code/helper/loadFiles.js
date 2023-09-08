import fs from "node:fs";
import path from "node:path";

const getAllFiles = function (dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function (file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file));
    }
  });

  return arrayOfFiles;
};

const loadFiles = (__dirname) => {
  const inputFolder = path.join(__dirname, "..", "input");
  const outputFolder = path.join(__dirname, "..", "output");

  if (!fs.existsSync(inputFolder)) {
    fs.mkdirSync(inputFolder, { recursive: true });
  }

  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder, { recursive: true });
  }

  const files = getAllFiles(inputFolder, []);
  const count = files.length;

  return { files, count, inputFolder, outputFolder };
};

export default loadFiles;
