const { spawn } = require('child_process');

module.exports = {
	pullDocker,
	runDocker,
	dumpPorts,
};

async function pullDocker(dockerImage) {
	return await _execDocker(['pull', dockerImage]);
}

async function runDocker(params) {
	const pid = await _execDocker(['run', '-d', '--rm', ...params], true);
	return pid;
}

async function dumpPorts(dockerName) {
	return await _execDocker(['port', dockerName]);
}

function _execDocker(params, captureOutput = false) {
	let output = '';
	const outputCollector = buffer => output += buffer;

	return new Promise((resolve, reject) => {
		console.info('/== spawning ' + '='.repeat(51));
		console.info(`|   docker ${params.join(' ')}`);
		console.info('\\' + '='.repeat(63));
		const child = spawn('docker', params, { stdio: [null, process.stdout, process.stderr] });

		if (captureOutput) {
			process.stdout.on('data', outputCollector);
		}

		child.on('exit', code => {
			if (captureOutput) {
				process.stdout.off('data', outputCollector);
			}
			if (code) {
				reject(code);
			} else {
				resolve(captureOutput ? output : undefined);
			}
		});
	});
}