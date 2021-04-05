const { spawn } = require('child_process');

module.exports = {
	pullDocker,
	runDocker
};

async function pullDocker(dockerImage) {
	return new Promise((resolve, reject) => {
		console.info(`spawning: docker pull ${dockerImage}`);
		const child = spawn('docker', ['pull', dockerImage], { stdio: 'pipe' });

		child.on('exit', code => {
			if (code) {
				reject(code);
			} else {
				resolve();
			}
		});
	});
}

async function runDocker(params) {
	return new Promise((resolve, reject) => {
		console.info(`spawning: docker run -d ${params.join(' ')}`);
		const child = spawn('docker', ['run', '-d', ...params], { stdio: 'pipe' });

		child.on('exit', code => {
			if (code) {
				reject(code);
			} else {
				resolve();
			}
		});
	});
}