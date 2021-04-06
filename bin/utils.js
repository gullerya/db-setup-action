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
		console.info('|');
		console.info(`| spawning: docker ${params.join(' ')}`);
		console.info('|');
		const child = spawn('docker', params, { stdio: [null, captureOutput ? null : process.stdout, process.stderr] });

		let output = null;
		if (captureOutput) {
			output = '';
			child.stdout.on('data', outputCollector);
		}

		child.on('exit', code => {
			if (captureOutput) {
				child.stdio.off('data', outputCollector);
				console.log(output);
			}
			if (code) {
				reject(code);
			} else {
				resolve(output);
			}
		});
	});
}