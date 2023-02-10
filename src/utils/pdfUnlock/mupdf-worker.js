importScripts("https://serverless.blueagle.top/static/libmupdf.js");

const mupdf = {
	unlock(data) {
		FS.writeFile("test_1.pdf", data)
		mupdf.writeDocument();
		let content = FS.readFile("/test_2.pdf");
		FS.unlink("/test_1.pdf");
		FS.unlink("/test_2.pdf");
		return content;
	}
};

let ready = false;

Module.onRuntimeInitialized = function () {
	Module.ccall('initContext');
	mupdf.writeDocument = Module.cwrap('writeDocument', 'null', []);
	postMessage("READY");
	ready = true;
};

onmessage = function (event) {
	let [func, args, id] = event.data;
	if (!ready) {
		postMessage(["ERROR", id, { name: "NotReadyError", message: "WASM module is not ready yet" }]);
		return;
	}
	try {
		let result = mupdf[func](...args);
		if (result instanceof ArrayBuffer)
			postMessage(["RESULT", id, result], [result]);
		else
			postMessage(["RESULT", id, result]);
	} catch (error) {
		postMessage(["ERROR", id, { name: error.name, message: error.message }]);
	}
}
