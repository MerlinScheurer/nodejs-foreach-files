import fs from "node:fs";
import path from "node:path";

const getFilesBySize = (folder, files) => {
  const fileAndSize = files.map((file) => {
    const size = fs.statSync(`${path.join(folder, file)}`).size;

    return {
      file,
      size,
    };
  });

  fileAndSize.sort((a, b) => a.size - b.size);

  return fileAndSize.map((f) => f.file);
};

export default getFilesBySize;
