import { Worker } from "worker_threads";

const imageWorker = new Worker("./worker/image_worker.js");
const gifWorker = new Worker("./worker/gif_worker.js");
// const av1Worker = new Worker("./worker/av1_worker.js");

export const workerByFileType = {
  avif: { worker: imageWorker, targetType: "avif" },
  jpg: { worker: imageWorker, targetType: "avif" },
  jpeg: { worker: imageWorker, targetType: "avif" },
  png: { worker: imageWorker, targetType: "avif" },
  webp: { worker: imageWorker, targetType: "avif" },
  gif: { worker: gifWorker, targetType: "mp4" },
  //   mp4: { worker: av1Worker, targetType: "mkv" },
  //   mkv: { worker: av1Worker, targetType: "mkv" },
};
