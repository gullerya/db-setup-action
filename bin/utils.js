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
	const pid = await _execDocker(['run', '-d', '-rm', ...params], true);
	return pid;
}

async function dumpPorts(pid) {
	return await _execDocker(['ports', pid]);
}

function _execDocker(params, captureOutput = false) {
	return new Promise(() => {
		console.info('');
		console.info(`spawning: docker ${params.join(' ')}`);
		console.info('');
		const child = spawn('docker', params, { stdio: [null, process.stdout, process.stderr] });

		let output = null;
		if (captureOutput) {
			output = '';
			child.stdout.on('data', out => output += out);
		}

		child.on('exit', code => {
			if (code) {
				reject(code);
			} else {
				resolve(output);
			}
		});
	});
}