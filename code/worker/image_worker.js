import fs from "node:fs";
import { parentPort } from "worker_threads";
import sharp from "sharp";

async function imageToAvif(cb, data) {
  const { source, target, verbose } = data;

  if (!fs.existsSync(target)) {
    sharp(source)
      .resize(6780, 4320, {
        fit: sharp.fit.inside,
        withoutEnlargement: true,
      })
      .avif({
        quality: 50,
        effort: 4,
        lossless: false,
        chromaSubsampling: "4:4:4",
      })
      .toFile(target)
      .then(() => {
        cb(true, data);
      })
      .catch((err) => {
        if (verbose) {
          console.log(err);
        }

        cb(false, data);
      });
  } else {
    cb(true, data);
  }
}

const cb = (result, data) => {
  parentPort.postMessage({
    target: data.target,
    result,
  });
};

parentPort.on("message", async (data) => {
  imageToAvif(cb, data);
});
