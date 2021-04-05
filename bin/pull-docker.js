const { spawn } = require('child_process');

module.exports = {
	pullDocker
};

async function pullDocker(dockerImage) {
	return new Promise((resolve, reject) => {
		const child = spawn('docker', ['pull', dockerImage]);

		child.stdout.on('data', out => console.info(out.toString()));
		child.stderr.on('data', err => console.error(err.toString()));

		child.on('exit', code => {
			if (code) {
				reject(code);
			} else {
				resolve();
			}
		});
	});
}