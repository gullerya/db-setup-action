const { spawn } = require('child_process');

module.exports = {
	pullDocker,
	dockerRun,
	dockerExec,
	dockerInspect,
	dumpPorts,
	retryUntil
};

async function pullDocker(dockerImage) {
	return await _execDocker(['pull', dockerImage]);
}

async function dockerRun(cname, params) {
	return await _execDocker(['run', '-d', '--rm', '--name', cname, ...params], true);
}

async function dockerExec(params) {
	return await _execDocker(['exec', '-t', ...params], true);
}

async function dockerInspect(cname, params) {
	return await _execDocker(['inspect', cname, ...params], true);
}

async function dumpPorts(cname) {
	return await _execDocker(['port', cname]);
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

async function retryUntil(logic, ttl, interval = 275) {
	const attempts = ttl / interval;
	let attempt = attempts;
	let result = false;

	while (attempt--) {
		console.info(`attemp ${attempts - attempt} of ${attempts}...`);
		try {
			result = await Promise.resolve(logic());
			process.stdout.write(result);
			if (result) {
				break;
			}
		} catch (e) {
			console.error(e);
		}
		await new Promise(r => setTimeout(r, interval));
	}

	return result;
}