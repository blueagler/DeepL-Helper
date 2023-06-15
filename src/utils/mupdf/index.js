import mupdfWorker from 'worker!./mupdf-worker.js';

const mupdf = {
  unlock: wrap("unlock")
};

const worker = new mupdfWorker();

worker.onmessage = function () {
  worker.promises = {};
  worker.promiseId = 0;
  worker.onmessage = function (event) {
    let [type, id, result] = event.data;
    if (type === "RESULT")
      worker.promises[id].resolve(result);
    else
      worker.promises[id].reject(result);
    delete worker.promises[id];
  }
}

function wrap(func) {
  return function (...args) {
    return new Promise(function (resolve, reject) {
      let id = worker.promiseId++;
      worker.promises[id] = { resolve: resolve, reject: reject };
      if (args[0] instanceof ArrayBuffer)
        worker.postMessage([func, args, id], [args[0]]);
      else
        worker.postMessage([func, args, id]);
    });
  }
}

export default mupdf;