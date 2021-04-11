const { exec } = require('child_process');

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
	return await _execDocker(['run', '-d', '--rm', '--name', cname, ...params], {
		captureOutput: true
	});
}

async function dockerExec(params) {
	return await _execDocker(['exec', '-t', ...params], {
		captureOutput: true
	});
}

async function dockerInspect(cname, params) {
	return await _execDocker(['inspect', cname, ...params], {
		captureOutput: true
	});
}

async function dumpPorts(cname) {
	return await _execDocker(['port', cname]);
}

function _execDocker(params, { captureOutput = false, reflectOutput = true } = { captureOutput: false, reflectOutput: true }) {
	let output = '';
	const outputCollector = buffer => {
		if (captureOutput) {
			output += buffer;
		}
		if (reflectOutput) {
			process.stdout.write(buffer);
		}
	}
	const errorCollector = buffer => process.stderr.write(buffer);

	return new Promise((resolve, reject) => {
		console.info();
		console.info('=== executing ' + '='.repeat(50));
		console.info(`docker ${params.join(' ')}`);
		console.info('='.repeat(64));
		const child = exec(`docker ${params.join(' ')}`);

		child.stderr.on('data', errorCollector);
		if (captureOutput || reflectOutput) {
			child.stdout.on('data', outputCollector);
		}

		child.once('exit', code => {
			child.stdout.off('data', outputCollector);
			child.stderr.off('data', errorCollector);
			if (code === 0) {
				resolve(captureOutput ? output : undefined);
			} else {
				reject(code);
			}
		});
		child.once('error', e => {
			child.stdout.off('data', outputCollector);
			child.stderr.off('data', errorCollector);
			reject(e);
		});
	});
}

async function retryUntil(title, logic, { ttl, interval = 453 }) {
	let result = false;

	const attempts = Math.ceil(ttl / interval);
	let counter = attempts;

	while (counter--) {
		console.info();
		console.info(`${title ? (title + ': ') : ''}attempt ${attempts - counter} of ${attempts}...`);
		try {
			result = await Promise.resolve(logic());
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