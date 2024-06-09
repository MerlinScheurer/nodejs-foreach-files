import fs from "node:fs";
import { parentPort } from "worker_threads";
import ffmpeg from "fluent-ffmpeg";

async function gifToMp4(cb, data) {
  const { source, target, verbose } = data;

  if (!fs.existsSync(target)) {
    if (verbose) {
      console.log("Starting transcode of: " + source);
    }

    const ffmpegCommand = ffmpeg()
      .input(source)
      .on("error", (err, stdout, stderr) => {
        if (verbose) {
          console.log("Cannot process video: " + err.message);
        }

        cb(false, data);
      })
      .on("progress", function (progress) {
        if (verbose) {
          console.log(
            "Processing: " +
              progress.percent +
              "% done @ " +
              progress.currentFps +
              " fps"
          );
        }
      })
      .on("end", (err, stdout, stderr) => {
        if (verbose) {
          console.log("Transcoding succeeded !");
        }

        cb(true, data);
      });

    ffmpegCommand.save(target);
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
  gifToMp4(cb, data);
});
