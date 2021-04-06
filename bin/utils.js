const { spawn } = require('child_process');

module.exports = {
	createDockerNetwork,
	pullDocker,
	runDocker
};

async function createDockerNetwork(networkName) {
	return new Promise((resolve, reject) => {
		console.info('');
		console.info(`spawning: docker network create ${networkName}`);
		console.info('');
		const child = spawn('docker', ['network', 'create', networkName], { stdio: [null, process.stdout, process.stderr] });

		child.on('exit', code => {
			if (code) {
				reject(code);
			} else {
				resolve();
			}
		});
	});
}

async function pullDocker(dockerImage) {
	return new Promise((resolve, reject) => {
		console.info('');
		console.info(`spawning: docker pull ${dockerImage}`);
		console.info('');
		const child = spawn('docker', ['pull', dockerImage], { stdio: [null, process.stdout, process.stderr] });

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
		console.info('');
		console.info(`spawning: docker run -d ${params.join(' ')}`);
		console.info('');
		const child = spawn('docker', ['run', '-d', ...params], { stdio: [null, process.stdout, process.stderr] });

		child.on('exit', code => {
			if (code) {
				reject(code);
			} else {
				resolve();
			}
		});
	});
}