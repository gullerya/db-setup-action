import { spawnSync } from 'child_process';

export {
	pullDocker
}

function pullDocker(dockerImage) {

	const child = spawnSync('docker', ['pull', dockerImage]);

	console.log('error', child.error);
	console.log('stdout ', child.stdout);
	console.log('stderr ', child.stderr);
}